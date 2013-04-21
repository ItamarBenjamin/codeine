package yami;

import java.util.List;

import yami.configuration.ConfigurationManager;
import yami.configuration.HttpCollector;
import yami.configuration.Node;
import yami.configuration.VersionCollector;
import yami.mail.CollectorOnNodeState;
import yami.mail.SendMailTLS;
import yami.model.Constants;
import yami.model.DataStore;
import yami.model.DataStoreRetriever;
import yami.model.Result;

public class SendMailStrategy
{
	
	public void mailCollectorResult(List<String> mailingList, HttpCollector c, Node n, Result results)
	{
		String successString = results.success() ? "OK" : "FAIL";
		String version = getVersion(n);
		String subject = "yami monitor '" + c.name + "' on " + n.nick() + version + " is now " + successString;
		String content = "Collector current status: " + Constants.CLIENT_LINK.replace(Constants.CLIENT_PORT, ConfigurationManager.getInstance().getCurrentGlobalConfiguration().getClientPort() + "").replace(Constants.NODE_NAME, n.name).replace(Constants.PEER_NAME, n.peer.dnsName()).replace(Constants.COLLECTOR_NAME, c.name) + "\n\n";
		content += "Dashboard: " + Constants.getServerDashboard() + "\n\n";
		content += "Collector Output:\n";
		content += results.output + "\n";
		ConfigurationManager cm = ConfigurationManager.getInstance();
		if (null == cm.getCurrentGlobalConfiguration() || null == cm.getCurrentGlobalConfiguration().email_configuration)
		{
		    Send.mail(subject, content, mailingList);
		}
		else
		{
		    SendMailTLS.mail(subject, content, mailingList, cm.getCurrentGlobalConfiguration().email_configuration);
		}
	}
	
	private String getVersion(Node node) 
	{
		DataStore ds = DataStoreRetriever.getD();
		CollectorOnNodeState result = ds.getResult(node, new VersionCollector());
		if (null == result)
		{
			return "";
		}
		return "version " + result.getLast().output;
	}
}
