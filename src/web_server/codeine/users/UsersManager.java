package codeine.users;

import javax.inject.Inject;

import org.eclipse.jetty.security.HashLoginService;
import org.eclipse.jetty.security.LoginService;
import org.eclipse.jetty.util.security.Credential;

import codeine.jsons.auth.CodeineUser;
import codeine.jsons.auth.IdentityConfJson;
import codeine.model.Constants;
import codeine.utils.ExceptionUtils;
import codeine.utils.JsonFileUtils;

public class UsersManager {

	private @Inject IdentityConfJson identityConfJson;
	private @Inject HashLoginService hashLoginService;
	private @Inject JsonFileUtils jsonFileUtils;
	
	private void store() {
		jsonFileUtils.setContent(Constants.getIdentityConfPath(), identityConfJson);
	}
	
	public LoginService loginService() {
		return hashLoginService;
	}

	public void initUsers() {
		for (CodeineUser user : identityConfJson.entries()) {
			user.api_token();
			putUser(user.username(), user.credentials());
		}
	}
	
	private void putUser(String name, String credentials) {
		hashLoginService.putUser(name, Credential.getCredential(credentials), new String[] { "user" });
	}

	public void addUser(String name, String credentials) {
		identityConfJson.add(name, credentials);
		store();
		putUser(name, credentials);
	}
	
	public CodeineUser userByApiToken(String api_token) {
		for (CodeineUser user : identityConfJson.entries()) {
			if (user.api_token().equals(api_token))
				return user;
		}
		throw ExceptionUtils.asUnchecked(new IllegalArgumentException("No such user with api token " + api_token));
	}
	
	public CodeineUser user(String name) {
		
		for (CodeineUser user : identityConfJson.entries()) {
			if (user.username().equals(name)) return user;
		}
		throw ExceptionUtils.asUnchecked(new IllegalArgumentException("No such user " + name));
	}
	
	public boolean isUserExists(String username) {
		return hashLoginService.getUsers().containsKey(username);
	}

	public boolean hasUsers() {
		return hashLoginService.getUsers().size() > 0;
	}
}
