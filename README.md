# regservice
A microservice for registering new users, as part of a larger project.

# Scope
This service only deals with user registration, so user authorization is not in scope.  This service will only be 
concerned with the username and password of the user.  If a third-party authentication service (i.e. Facebook, Google) 
is being used to authentication then just that user ID will be stored.  Otherwise, username should be an email address
and the password will be locally stored in an encrypted one-way hash with appropriate security measures (i.e. salt, IV)

# Workflow Design
The idea of this microservice is to accept user information for the purpose of registration into an application.  Once
the user has provided the necessary information, the information will be stored and a registration email will be sent
to confirm the email account.  A captcha of some sort may be used to reduce the risk of bots.

# Functionality Details
This registration process should be presented by a separate HTML web page, so calling the /registration/ of a web site 
should display the registration page and everything should be handled from there.  Redirection to the login page may
be something desired after registration, so that should be an option.

