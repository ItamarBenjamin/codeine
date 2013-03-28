package yami;

import static com.google.common.collect.Lists.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import yami.configuration.Peer;
import yami.model.Constants;
import yami.model.DataStoreRetriever;
import yami.model.Result;
import yami.utils.ProcessExecuter;

public class AllPeersRestartServlet extends HttpServlet
{
	private static final Logger log = Logger.getLogger(AllPeersRestartServlet.class);
	private static final long serialVersionUID = 1L;
	private PrintWriter writer;
	
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
	{
		log.info("ClientRestartServlet started");
		writer = res.getWriter();
		writer.println("Recived restart request");
		List<String> command = newArrayList(Constants.getInstallDir() + "/bin/restartAllPeers");
		for (Peer peer : DataStoreRetriever.getD().peers())
		{
			command.add(peer.name);
		}
		Result r = ProcessExecuter.execute(command);
		writer.println("executing " + command);
		writer.println(r.output);
		writer.println("finished!");
	}
	
}