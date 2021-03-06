package codeine;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ThreadPoolExecutor;

import javax.inject.Inject;

import org.apache.log4j.Logger;

import codeine.configuration.ConfigurationReadManagerServer;
import codeine.configuration.PathHelper;
import codeine.db.ProjectsConfigurationConnector;
import codeine.db.mysql.connectors.ProjectConfigurationDatabaseConnectorListProvider;
import codeine.executer.ThreadPoolUtils;
import codeine.jsons.project.ProjectJson;
import codeine.model.Constants;
import codeine.utils.ExceptionUtils;
import codeine.utils.FilesUtils;
import codeine.utils.JsonFileUtils;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

public class ConfigurationManagerServer extends ConfigurationReadManagerServer
{
	private static final Logger log = Logger.getLogger(ConfigurationManagerServer.class);
	private static final int MAX_NUM_OF_DB_ENTRIES = 30;
	private static final int NUM_OF_THREADS_FOR_EACH_DB = 1;

	private ProjectConfigurationInPeerUpdater projectsUpdater;
	private PathHelper pathHelper;
	private JsonFileUtils jsonFileUtils;
	private ProjectConfigurationDatabaseConnectorListProvider statusDatabaseConnectorListProvider;
	private Cache<String, ThreadPoolExecutor> dbUpdateThreadsMap = CacheBuilder.newBuilder().maximumSize(MAX_NUM_OF_DB_ENTRIES).build();

	@Inject
	public ConfigurationManagerServer(JsonFileUtils jsonFileUtils, PathHelper pathHelper, ProjectConfigurationInPeerUpdater projectsUpdater, ProjectConfigurationDatabaseConnectorListProvider statusDatabaseConnectorListProvider)
	{
		super(jsonFileUtils, pathHelper);
		this.jsonFileUtils = jsonFileUtils;
		this.pathHelper = pathHelper;
		this.projectsUpdater = projectsUpdater;
		this.statusDatabaseConnectorListProvider = statusDatabaseConnectorListProvider; 
	}

	public void deleteProject(final ProjectJson projectToDelete) {
		String dirName = pathHelper.getProjectsDir() + "/" + projectToDelete.name();
		FilesUtils.delete(dirName);
		projects().remove(projectToDelete.name());
		for (final ProjectsConfigurationConnector projectsConfigurationConnector : statusDatabaseConnectorListProvider.get()) {
			getUpdateThreadPool(projectsConfigurationConnector.getKey()).execute(new Runnable() {
				@Override
				public void run() {
					try {
						projectsConfigurationConnector.deleteProject(projectToDelete);
					} catch (Exception e) {
						log.warn("cannot update project in database " + projectToDelete.name() + " " + projectsConfigurationConnector, e);
					}
				}
			});
		}
	}


	private ThreadPoolExecutor getUpdateThreadPool(String key) {
		try {
			return dbUpdateThreadsMap.get(key, new Callable<ThreadPoolExecutor>() {
				@Override
				public ThreadPoolExecutor call() throws Exception {
					return ThreadPoolUtils.newThreadPool(NUM_OF_THREADS_FOR_EACH_DB);
				}
			});
		} catch (ExecutionException e) {
			throw ExceptionUtils.asUnchecked(e);
		}
	}

	public boolean updateProject(final ProjectJson updatedProject) {
		log.info("updating project " + updatedProject);
		String file = pathHelper.getProjectsDir() + "/" + updatedProject.name() + "/" + Constants.PROJECT_CONF_FILE;
		jsonFileUtils.setContent(file, updatedProject);
		final ProjectJson previousProject = projects().put(updatedProject.name(), updatedProject);
		log.info("updating project in db and peers " + updatedProject.name());
		updateProjectInDb(updatedProject);
		projectsUpdater.updatePeers(updatedProject, previousProject);
		return null != previousProject;
	}

	public void updateDb() {
		for (ProjectJson project : projects().values()) {
			updateProjectInDb(project);
		}
		projectsUpdater.updateAllPeers();
	}

	private void updateProjectInDb(final ProjectJson project) {
		for (final ProjectsConfigurationConnector projectsConfigurationConnector : statusDatabaseConnectorListProvider.get()) {
			getUpdateThreadPool(projectsConfigurationConnector.getKey()).execute(new Runnable() {
				@Override
				public void run() {
					try {
						projectsConfigurationConnector.updateProject(project);
					} catch (Exception e) {
						log.warn("cannot update project in database " + project.name() + " " + projectsConfigurationConnector, e);
					}
				}
			});
		}
	}

	public void createNewProject(ProjectJson project) {
		String dir = pathHelper.getProjectsDir() + "/" + project.name();
		if (FilesUtils.exists(dir)) {
			throw new RuntimeException("project '"+ project.name() + "' already exists");
		}
		log.info("creating project in " + dir);
		FilesUtils.mkdirs(dir);
		updateProject(project);
	}

}
