
/*
 * GET home page.
 */

var queryExec = require("./queryExecutor");
var ejs = require("ejs");

function index(req, res){

  res.render("index");
}

// This function creates new account in facebook.

function signUp(req, res){
	
	var signUpInfo, queryString;
	
	console.log("Inside Server's SignUp function...");
	
	signUpInfo = req.body;
	
	//Check if the Email ID user is giving while creating an account already exists. If yes then, don't allow to create an account.
	
	queryString = "SELECT email_id FROM users WHERE email_id = '" + signUpInfo.emailId + "'";  
	console.log("Account already exists Query is: "+ queryString);
	
	
	queryExec.fetchData(function(err,results){
		if(err){
			throw err;
		}
		else 
		{
				
				if(results.length > 0){
					console.log("Email ID already exists");
					res.end("This Email ID already exists. Please choose unique email ID.");
				}
				
				else{
					console.log("Creating account...");
					
					queryString = "INSERT INTO users (`email_id`, `fname`, `lname`, `password`) VALUES ('" + signUpInfo.emailId + "', '" + signUpInfo.fName + "', '" + signUpInfo.lName + "', '" + signUpInfo.password + "')";  
					console.log("Sign Up Query is: "+ queryString);
					
					queryExec.fetchData(function(err,results){
						if(err){
							throw err;
						}
						else 
						{
								req.session.emailId = signUpInfo.emailId;
								console.log("Successful Sign UP");
								res.end("Congratulations!!! Your account has been created successfully.");
								
						}	
					},queryString);

				}
			
			}	
		},queryString);
	
		
}


//This function logs user in facebook.

function login(req, res){
	
	var loginInfo, queryString;
	
	console.log("Inside Server's login function...");
	
	loginInfo = req.body;
	
	//Check if the Email ID and Password exists in the system.
	
	queryString = "SELECT email_id FROM users WHERE email_id = '" + loginInfo.loginEmail + "' AND password = '" + loginInfo.loginPass + "'";  
	console.log("Login Query is: "+ queryString);
	
	
	queryExec.fetchData(function(err,results){
		if(err){
			throw err;
		}
		else 
		{
				
				if(results.length > 0){
					req.session.emailId = loginInfo.loginEmail;
					console.log("Allow Login");
					res.end("Logged in successfully.");
				}
				
				else{
					console.log("Invalid Login...");
				}
			
			}	
		},queryString);
	
		
}


function home(req, res){
	
	console.log("Inside home function..");
	
	if (req.session.emailId){
		res.render("home");
	}
	else{
		res.render("index");
	}
	
	
}

function about(req, res){
	
	console.log("Inside about function");
	if (req.session.emailId){
		res.render("about");
	}
	else{
		res.render("index");
	}
	
}

function getProfile(req, res){
	
	var queryString;
	
	console.log("Inside getProfile function");
	
	if (req.session.emailId){
		
		//Check if the Email ID and Password exists in the system.
		
		queryString = "SELECT * FROM users_workinfo uw, users_education ue, users_contact_info uc " +
					  "WHERE uw.email_id = '" + req.session.emailId + "' AND uw.email_id = ue.email_id AND ue.email_id = uc.email_id";  
		console.log("Get Profile Query is: "+ queryString);
		
		queryExec.fetchData(function(err,results){
			
			if(err){
				throw err;
			}
			else 
			{
					
					if(results.length > 0){
						console.log("Found Workinfo...");
						console.log(results);
					}
					
					else{
						console.log("No Workinfo in the system...");
					}
				
				}	
			},queryString);

		
		
	}
	else{
		res.render("index");
	}
	
}

function searchFriend(req, res) {
	
	var friendName = "", queryString = "";
	var friendFlag = false, statusFlag = false;
	
	console.log("inside searchFriend function...");
	
	friendName = req.body;
	
	queryString = "SELECT fname, lname, email_id FROM users WHERE fname = '" + friendName.name + "'";  
	console.log("Search friend Query is: "+ queryString);
	
	
	queryExec.fetchData(function(err,results){
		if(err){
			throw err;
		}
		else 
		{
				
				if(results.length > 0){
					console.log("Friend you are trying to search exists in the system...");
					console.log(results);
					friendFlag = true;
					
					// After you are sure that this user exists in the system, check the status of friend request.
					
					queryString = "SELECT request_status FROM friend_request WHERE source_email = '" + req.session.emailId + "' AND " + 
								  "dest_email = '" + results[0].email_id + "'";  
					console.log("Request Status Query is: "+ queryString);

					queryExec.fetchData(function(err,requestStatus){
						
						if(err){
							throw err;
						}
						else 
						{
								
								if(requestStatus.length > 0){
									console.log("Found Pending or accepted request...");
									console.log(requestStatus);
									statusFlag = true;
									
									
									// Send 'Friend request status' to client
									console.log(friendFlag);
									console.log(statusFlag);
									
									if (friendFlag === true){
										
										if (statusFlag === true){
											
											// Fetching fname, lname and request status of destination user which will be returned to the client.
											
											queryString = "SELECT ue.fname, ue.lname, fr.request_status, fr.sender_email, fr.dest_email FROM users ue, friend_request fr " +
														  "WHERE fr.source_email = '" + req.session.emailId + "' AND " + 
														  "fr.dest_email = '" + results[0].email_id + "' AND ue.email_id = fr.dest_email";  
											console.log("Final search friend query: "+ queryString);
											
											queryExec.fetchData(function(err,finalResult){
												
												if(err){
													throw err;
												}
												else 
												{
														
														if(finalResult.length > 0){
															console.log("Final search friend details...");
															console.log(finalResult);
															res.end(JSON.stringify(finalResult));
														}
														
														else{
															console.log("Final search friend details failed...");
														}
													
												}	
												},queryString);
											
										}
										else{
											console.log("Send friend request");
											res.end("N"); // Friend request can be sent
										}
									}
								}
								else{
									console.log("Send friend request. No request in friend_request table");
									res.end("N"); // Friend request can be sent
								}
								
						}	
						},queryString);
					
				}
				
				else{
					console.log("Friend you are trying to search DOES NOT EXIST in the system.");
					res.end("Not Found");
				}
			
			}	
		},queryString);
	
}


// This function inserts a record into FRIEND_REQUEST table

function sendRequest(req, res) {
	
	console.log("inside sendRequest() function...");
	
	var destFriend = "", queryString = "";
		
	destFriend = req.body;
	
	// Getting Email ID of destination friend...
	queryString = "SELECT email_id FROM users WHERE fname = '" + destFriend.destination + "'";
	console.log("Destination friend's Query is: "+ queryString);
	
	queryExec.fetchData(function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{
				
				if(results.length > 0){
					console.log("Found destination user...");
					console.log(results);
					
					queryString = "INSERT INTO friend_request (source_email, dest_email, request_status, sender_email) " +
								  "VALUES ('" + req.session.emailId + "', '" + results[0].email_id + "', 'P', '" + req.session.emailId + "')";
					console.log("INSERT friend_request Query1 is: "+ queryString);
					
					queryExec.fetchData(function(err,insertResult){
						
						if(err){
							throw err;
						}
						else 
						{
								
								
									console.log("FRIEND_REQUEST Record1 inserted successfully...");
									
									queryString = "INSERT INTO friend_request (source_email, dest_email, request_status, sender_email) " +
									  			  "VALUES ('" + results[0].email_id + "', '" + req.session.emailId + "', 'P', '" + req.session.emailId + "')";
									console.log("INSERT friend_request Query2 is: "+ queryString);
									
									queryExec.fetchData(function(err,results2){
										
										if(err){
											throw err;
										}
										else 
										{
												
												if(results2.length > 0){
													console.log("FRIEND_REQUEST Record2 inserted successfully...");
													
												}
												
											
										}	
									},queryString);
									
						}
								
						},queryString);
					}

				else{
					console.log("No destination user found...");
				}
			
			}	
		},queryString);

}

function acceptFriend(req, res) {
	
	var queryString = "", acceptFrnd = "";
	console.log("inside acceptRequest() function...");
	
	acceptFrnd = req.body;
	
	queryString = "SELECT email_id FROM users WHERE fname = '" + acceptFrnd.acceptFriend + "'";
	console.log("Accpet friend's SELECT Query is: "+ queryString);
	
	queryExec.fetchData(function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{
				
				if(results.length > 0){
					
					console.log("Running UPDATE query to update request_status");
					
					queryString = "UPDATE FRIEND_REQUEST set request_status = 'A', sender_email = NULL WHERE source_email in ('" +
								   req.session.emailId + "', '" + results[0].email_id + "') AND dest_email in ('" + req.session.emailId +
								   "', '" + results[0].email_id + "')";
								  
					console.log("UPDATE 'FRIEND_REQUEST' Query is: "+ queryString);
					
					queryExec.fetchData(function(err,results){
						
						if(err){
							throw err;
						}
						else 
						{
								
							console.log("FRIEND_REQUEST table updated successfully showing acceptance of request");
									
						}
											
					},queryString);
					
				}
		}
	
	},queryString);	
}


function newsFeed(req, res) {
	
	var queryString = "", news = "";
	console.log("inside newsFeed() function...");
	
	news = req.body;
	
	queryString = "INSERT INTO news_feed (email_id, feed) VALUES ('" + req.session.emailId + "', '" + news.newsfeed + "')"; 
	console.log("INSERT query for news feed: "+ queryString);
	
	queryExec.fetchData(function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{
			res.end("Success");
		}
	
	},queryString);	
	
	
}

function wall(req, res) {
	
	var queryString = "";
	console.log("inside wall() function...");
	
	queryString = "SELECT nf.feed, u.fname, u.lname FROM news_feed nf, users u WHERE nf.email_id IN (SELECT dest_email FROM friend_request WHERE source_email = '" +
				   req.session.emailId + "' AND request_status = 'A') AND nf.email_id = u.email_id"; 
	console.log("SELECT query for news feed: "+ queryString);
	
	queryExec.fetchData(function(err,results){
		
		if(err){
			throw err;
		}
		else 
		{
			if(results.length > 0){
				// Send all the news feeds back to client
				console.log("Sending news feed");
				res.end(JSON.stringify(results));
			}
		}
	
	},queryString);	
	
	
}

function groups(req, res) {
	
	console.log("Inside Group function...");
	
	if(req.session.emailId){
		console.log("fine..");
		res.render('group');
	}
	else{
		res.render('index');
	}
}

function createGroup(req, res) {
	
	var groupName = "", queryString = "";
	console.log("Inside Create Group function...");
	
	groupName = req.body;
	
	queryString = "INSERT into GROUPS (group_name, email_id, admin_ind) VALUES ('" + groupName.groupName + "', '" + req.session.emailId +
				  "', 'Y')";
	console.log("INSERT Query for Group: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
	throw err;
	}
	else 
	{
	if(results.length > 0){
		// Send all the news feeds back to client
		console.log("Group Created successfully");
		res.end(JSON.stringify(results));
	}
	}
	
	},queryString);
	
}

function getGroups(req, res) {
	
	console.log("Inside getGroups() function...");
	
	var queryString = "";
		
	queryString = "SELECT group_name FROM groups WHERE email_id = '" + req.session.emailId + "'"; 
	console.log("Query for getGroups: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
		if(results.length > 0){
			// Send all the news feeds back to client
			console.log("Groups fetched successfully");
			res.end(JSON.stringify(results));
		}
	}
	
	},queryString);
}


function groupDetails(req, res) {
	
	console.log("inside groupDetails function...");
	
	var queryString = "", grpName = "";
		
	grpName = req.body;
	
	queryString = "SELECT g.admin_ind, g.email_id, u.fname, u.lname FROM groups g, users u WHERE g.group_name = '" + grpName.groupName + "' AND u.email_id" +
				  " = g.email_id"; 
	console.log("Query for groupDetails: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
		if(results.length > 0){
			// Send all the news feeds back to client
			console.log("Group Details fetched successfully");
			res.end(JSON.stringify(results));
		}
	}
	
	},queryString);
	
}


function deleteMembers(req, res) {
	
	console.log("Inside delete Member function...");
	
	var queryString = "", member = "";
	
	member = req.body;
	
	queryString = "DELETE from GROUPS where group_name = '" + member.grpName + "' AND email_id = '" + member.memberId + "'";
	console.log("Query for Delete Members: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
			console.log("Member deleted successfully");
			res.end(JSON.stringify(results));
		
	}
	
	},queryString);

}

function getFriends(req, res) {
	
	console.log("inside getFriends function...");
	
	var queryString = "";
	
	queryString = "SELECT u.email_id, u.fname, u.lname from users u, friend_request f WHERE u.email_id IN (SELECT f.dest_email FROM " +
				  "friend_request WHERE f.request_status = 'A' AND f.source_email = '" + req.session.emailId + "')"; 
	console.log("Query for Get Friends: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
		if(results.length > 0){
			console.log("List of friends fetched successfully");
			res.end(JSON.stringify(results));
		}
	}
	
	},queryString);

}


function addMember(req, res) {
	
	console.log("inside addMember function...");
	
	var queryString = "", member = "";
	
	member = req.body;
	
	queryString = "INSERT into groups (group_name, email_id, admin_ind) VALUES ('" + member.grpName + "', '" + member.memberId + "', 'N')";
	console.log("Query for Add Member to a group: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
			console.log("Member added successfully");
			res.end(JSON.stringify(results));
		
	}
	
	},queryString);

	
}

function workedu(req, res) {
	
	console.log("inside WorkEducation function...");
	
	if (req.session.emailId){
		res.render('workEdu');
	}
	else{
		res.render('index');
	}
		
}

function saveWorkEdu(req, res) {
	
	console.log("inside saveWorkEdu function...");
	
	var queryString = "", workEdu = "";
	
	workEdu = req.body;
	
// Inserting Education Information
	
	queryString = "INSERT into edu_info (email_id, college_name, college_location) VALUES ('" + req.session.emailId + "', '" + workEdu.uniName + "', '" + workEdu.uniLoc + "')"; 
	console.log("Insert Edu Info: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
			console.log("Education Information added successfully");
			res.end(JSON.stringify(results));
		
	}
	
	},queryString);
	
// Inserting Work Information
	
	queryString = "INSERT into work_info (email_id, company_name, company_location, designation) VALUES ('" + req.session.emailId + "', '" + workEdu.compName + "', '" + workEdu.compLoc + "', '" + workEdu.desig + "')"; 
	console.log("Insert Work Info: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
			console.log("Work Information added successfully");
			res.end(JSON.stringify(results));
		
	}
	
	},queryString);


		
}

function contactInfo(req, res) {
	
	console.log("inside contactInfo function...");
		
	if (req.session.emailId){
		res.render('contactInfo');
	}
	else{
		res.render('index');
	}
	
}

function saveContactInfo(req, res) {
	
	console.log("inside saveContactInfo function...");
	
	var queryString = "", contactInfo = "";
	
	contactInfo = req.body;
	
// Inserting Education Information
	
	queryString = "INSERT into users_contact_info (email_id, phone_no, address) VALUES ('" + req.session.emailId + "', '" + contactInfo.phone + "', '" + contactInfo.address + "')"; 
	console.log("Insert Edu Info: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
			console.log("Education Information added successfully");
			res.end(JSON.stringify(results));
		
	}
	
	},queryString);
	
}

function overview(req, res) {
	
	console.log("inside overview function...");
	
	var queryString = "";
	
	queryString = "SELECT u.email_id, u.fname, u.lname, uc.phone_no, uc.address FROM users u, users_contact_info uc WHERE u.email_id = uc.email_id AND u.email_id = '" + req.session.emailId + "'"; 
	console.log("Overview Query: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
			if (results.length > 0){
				console.log("Overview information fectched successfully");
				res.end(JSON.stringify(results));
			}
	}
	
	},queryString);
	
}

function life(req, res) {
	
	console.log("inside life function...");
		
	if (req.session.emailId){
		res.render('life');
	}
	else{
		res.render('index');
	}
	
}


function getLife(req, res) {
	
	console.log("inside getLife function...");
	
	var queryString = "";
	
	queryString = "SELECT w.company_name, e.college_name FROM work_info w, edu_info e WHERE w.email_id = e.email_id AND w.email_id = '" + req.session.emailId + "'"; 
	console.log("Life Query: "+ queryString);

	queryExec.fetchData(function(err,results){
	
	if(err){
		throw err;
	}
	else 
	{
			if (results.length > 0){
				console.log("Life information fectched successfully");
				res.end(JSON.stringify(results));
			}
	}
	
	},queryString);
	
}

function logout(req, res) {
	
	console.log("inside logout function...");
	req.session.destroy();
}

exports.index=index;
exports.signUp=signUp;
exports.login=login;
exports.home=home;
exports.about=about;
exports.getProfile=getProfile;
exports.logout=logout;
exports.searchFriend=searchFriend;
exports.sendRequest=sendRequest;
exports.acceptFriend=acceptFriend;
exports.newsFeed=newsFeed;
exports.wall=wall;
exports.groups=groups;
exports.createGroup=createGroup;
exports.getGroups=getGroups;
exports.groupDetails=groupDetails;
exports.deleteMembers=deleteMembers;
exports.getFriends=getFriends;
exports.addMember=addMember;
exports.workedu=workedu;
exports.saveWorkEdu=saveWorkEdu;
exports.contactInfo=contactInfo;
exports.saveContactInfo=saveContactInfo;
exports.overview=overview;
exports.life=life;
exports.getLife=getLife;