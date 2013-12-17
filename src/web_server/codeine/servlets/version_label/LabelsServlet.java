package codeine.servlets.version_label;

import java.io.PrintWriter;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import codeine.jsons.labels.LabelJsonProvider;
import codeine.jsons.labels.ProjectLabelVersionJson;
import codeine.model.Constants;
import codeine.servlet.AbstractFrontEndServlet;
import codeine.servlet.PermissionsManager;
import codeine.servlet.TemplateData;
import codeine.servlet.TemplateLink;
import codeine.servlet.TemplateLinkWithIcon;
import codeine.servlets.template.HtmlMainTemplate;
import codeine.servlets.template.LabelsTemplateData;
import codeine.utils.UrlUtils;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.inject.Inject;

public class LabelsServlet extends AbstractFrontEndServlet {
	
	@Inject	private LabelJsonProvider versionLabelJsonProvider;
	@Inject private HtmlMainTemplate htmlMainTemplate;
	@Inject private PermissionsManager permissionsManager;
	
	private static final long serialVersionUID = 1L;
	
	protected LabelsServlet() {
		super("", "labels", "command_history", "labels", "command_history");
	}
	
	@Override
	protected void myPost(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter writer = getWriter(response);
		ProjectLabelVersionJson versionLabelJson = readBodyJson(request, ProjectLabelVersionJson.class);
		versionLabelJsonProvider.updateLabel(versionLabelJson);
		writer.write("{}");
	}
	
	@Override
	protected void myDelete(HttpServletRequest request, HttpServletResponse response) {
		PrintWriter writer = getWriter(response);
		String projectName = request.getParameter("project");
		String label = request.getParameter("label");
		versionLabelJsonProvider.deleteLabel(label, projectName);
		writer.write("{}");
	}

	@Override
	protected TemplateData doGet(HttpServletRequest request, PrintWriter writer) {
		String projectName = request.getParameter(Constants.UrlParameters.PROJECT_NAME);
		setTitle(projectName);
		
		boolean readOnly = !permissionsManager.canCommand(projectName, request);
		
		return new LabelsTemplateData(projectName, Lists.newArrayList(versionLabelJsonProvider.versions(projectName)), readOnly);
	}

	@Override
	protected List<TemplateLink> generateNavigation(HttpServletRequest request) {
		String projectName = request.getParameter(Constants.UrlParameters.PROJECT_NAME);
		return Lists.newArrayList(new TemplateLink(projectName, UrlUtils.buildUrl(Constants.PROJECT_STATUS_CONTEXT, ImmutableMap.of(Constants.UrlParameters.PROJECT_NAME, projectName))), new TemplateLink("Labels", "#"));
	}

	@Override
	protected List<TemplateLinkWithIcon> generateMenu(HttpServletRequest request) {
		return getMenuProvider().getProjectMenu(request);
	}

}