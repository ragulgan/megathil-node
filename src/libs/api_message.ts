const minUserAge = 16;
export const apimsgconfig = {
  en: {
    201: 'Saved successfully.',
    202: 'Deleted successfully.',
    400: 'Bad request.',
    500: 'Unexpected error. Please try again.',
    1001: 'Authenticated successfully.',
    1002: 'User created successfully.',
    1003: 'Bad request.',
    1004: 'Record(s) found.',
    1005: 'Record(s) not found.',
    1006: 'User updated successfully.',
    1007: 'User deleted successfully.',
    1048: 'A user with this email already exists.',
    1149: 'A user with this mobile number already exists.',
    1150: 'This student ID already exists.',
    1501: 'User earnings list retrieved.',
    1502: 'User earnings not found.',

    //login
    1008: 'An OTP has been sent to your email or mobile number.',
    1009: 'Invalid mobile number or email or OTP. Please try again.',
    2001: 'Please log in from the device already registered or contact the administrator.',
    2003: 'Incorrect Mobile code. Please try again',
    2014: 'Invalid mobile number or email or OTP. Please try again.',
    2015: 'Invalid email Id or mobile number. Please try again',
    2018: 'OTP has been expired. Please try again.',
    2019: 'Invalid OTP. Please try again.',

    //Staff
    1010: 'A staff member with this email already exists.',
    1110: 'A staff member with this mobile number already exists.',
    1011: 'Staff created successfully.',
    1012: 'Staff updated successfully.',
    1013: 'Staff deleted successfully.',
    1101: 'Invalid email or password.',

    //Amdin
    1014: 'Admin logged in successfully.',
    1015: 'Admin user created successfully.',
    1016: 'Admin user updated successfully.',
    1017: 'Admin user deleted successfully.',
    1018: 'Please check your admin credentials.',
    1019: 'This administrator already exists.',

    //Question
    1020: 'Question created successfully.',
    1021: 'Question updated successfully.',
    1022: 'Question deleted successfully.',

    //Module
    1023: 'Module created successfully.',
    1024: 'Module updated successfully.',
    1025: 'Module deleted successfully.',

    //Units
    1026: 'Units created successfully.',
    1027: 'Units updated successfully.',
    1028: 'Units deleted successfully.',

    //Role
    1029: 'Role created successfully.',
    1030: 'Role updated successfully.',
    1031: 'Role deleted successfully.',
    1132: 'A role with that name already exists. Please choose a different name.',

    //Media Library
    1032: 'Media library created successfully.',
    1033: 'Media library updated successfully.',
    1034: 'Media library deleted successfully.',

    //Question type
    1035: 'Question type created successfully.',
    1036: 'Question type updated successfully.',
    1037: 'Question type deleted successfully.',
    1135: 'A question type with that name already exists.',

    //Template type
    1038: 'Template type created successfully.',
    1039: 'Template type updated successfully.',
    1040: 'Template type deleted successfully.',
    1138: 'A template type with that name already exists.',

    //Options 
    1041: 'Options created successfully.',
    1042: 'Options updated successfully.',
    1043: 'Options deleted successfully.',
    5010: 'Cannot set valid option to multiple true when question multiple select is false.',

    //Module
    1044: 'Module created successfully.',
    1045: 'Module updated successfully.',
    1046: 'Module deleted successfully.',

    //1047 QuestionResponse
    1047: 'Question response submitted successfully.',
    1049: 'Question response ID is not recognized.',

    //College 
    1050: 'College created successfully.',
    1051: 'College updated successfully.',
    1052: 'College deleted successfully.',
    1553: 'This college is linked with staff. Please unlink it from staff to delete.',
    1554: 'This college is linked with users. Please unlink it from users to delete.',

    //Course 
    1053: 'Course created successfully.',
    1054: 'Course updated successfully.',
    1055: 'Course deleted successfully.',
    1153: 'A course with this name already exists.',

    //Department 
    1056: 'Department created successfully.',
    1057: 'Department updated successfully.',
    1058: 'Department deleted successfully.',
    1156: 'A department with this name already exists.',

    /* file upload */
    1059: 'Something went wrong. The file was not uploaded.',
    1060: 'File uploaded successfully.',
    1061: 'File deleted successfully.',
    1062: 'File not found or already deleted.',
    1063: 'Invalid or expired token.',
    1064: 'Image file size exceeds the maximum allowed size.',
    1065: 'Video file size exceeds the maximum allowed size.',
    1066: 'Unsupported file type.',

    //Country 
    1067: 'Country created successfully.',
    1068: 'Country updated successfully.',
    1069: 'Country deleted successfully.',
    1070: 'Country ID not recognized.',
    1167: 'A country with this name already exists.',

    //Department 
    1071: 'State created successfully.',
    1072: 'State updated successfully.',
    1073: 'State deleted successfully.',
    1074: 'State ID not recognized.',
    1171: 'A state with this name already exists.',

    //City 
    1075: 'City created successfully.',
    1076: 'City updated successfully.',
    1077: 'City deleted successfully.',
    1078: 'City ID not recognized.',
    1175: 'A city with this name already exists.',

    //Interviewer 
    1079: 'Interviewer created successfully.',
    1080: 'Interviewer updated successfully.',
    1081: 'Interviewer deleted successfully.',
    1082: 'Interviewer ID not recognized.',
    1083: 'This interviewer already exists.',

    1091: 'Trophy details created successfully.',
    1092: 'Trophy details updated successfully.',
    1093: 'Trophy deleted successfully.',
    1191: 'A trophy with these details already exists.',

    //Xp 
    1094: 'Experience points created successfully.',
    1095: 'Experience points updated successfully.',
    1096: 'Experience points deleted successfully.',
    1194: 'An experience point with these details already exists.',

    //Gems 
    1097: 'Gems created successfully.',
    1098: 'Gems updated successfully.',
    1099: 'Gems deleted successfully.',
    1197: 'Gems with these details already exist.',

    //changepassword 
    2000: 'Current password is incorrect.',
    2002: 'Account does not exist.',
    2004: 'Congratulations, you have successfully updated your password!',

    //Xp 
    2005: 'Transaction created successfully.',

    //Admin-Changepassword
    2006: 'Staff password has been updated.',
    2007: 'Interviewer password has been updated.',

    2200: 'Badge saved successfully.',
    2204: 'Badge deleted successfully.',
    2409: 'Badge already exists.',

    3200: 'Achievement saved successfully.',
    3204: 'Achievement deleted successfully.',
    3409: 'Achievement already exists.',

    //Gems package
    3205: 'Gems package created successfully.',
    3206: 'Gems package updated successfully.',
    3207: 'Gems package deleted successfully.',
    3211: 'Gems package already exists.',

    //Gems 
    3208: 'Gems purchased successfully.',
    3210: 'Gems purchase failed. If your amount gets debitted contact support.',

    3300: 'Carousel saved.',
    3340: 'Unable to save carousel.',
    3341: 'Carousel updated.',
    3342: 'Carousel deleted.',

    4200: 'Availability plan saved.',
    4201: 'Booked interview successfully.',
    4203: 'Interview is not available to book.',
    4204: 'Interview already booked and waiting for approval.',
    4205: 'Cannot approve: no request received yet.',
    4206: 'Interview request already accepted.',
    4207: 'Interview already completed.',
    4208: 'Access denied: you are not having access to this interview.',
    4209: 'Interview accepted successfully!',
    4210: 'Unable to accept interview request.',
    4211: 'Cannot reject: no request received yet.',
    4212: 'Interview request already rejected.',
    4213: 'Unable to reject interview request.',
    4214: 'Booking rejected.',
    4215: 'Cannot cancel: no request received yet.',
    4216: 'Interview cancelled.',
    4217: 'Unable to cancel interview request.',
    4218: 'Already cancelled by the interviewer.',
    4219: 'Interview already cancelled.',
    4220: 'Already cancelled by the user.',
    4240: 'Interview still not accepted and in pending requests.',
    4241: "Interview results updated successfully.",
    4242: "Unable to save interview results.",
    4243: "You can reschedule and interview only once.",
    4244: "Interview rescheduled successfully.",
    //Exist 
    4226: 'Email address already exists.',
    4222: 'Mobile number already exists.',
    4223: 'Staff ID already exists.',
    4224: 'Achievement name already exists.',
    4225: 'Achievement key name already exists.',
    4221: 'Holiday(s) saved.',
    4252: 'Leave(s) saved.',
    4227: 'Availability not found.',
    4228: 'Booking not found.',
    4229: 'Booking cancelled.',
    4232: 'Invalid availability ID or availability not found.',
    4233: 'Requested slot time is not valid.',
    4234: 'You have already booked this slot.',

    //MediaLikes 
    4230: 'Like updated successfully.',
    4231: 'Dislike updated successfully.',

    4300: 'Insufficient gems to unlock this unit.',
    4301: 'Unit is already unlocked.',
    4302: 'Unit unlocked successfully.',

    // refresh token messages
    1498: 'Invalid token.',
    1404: 'User does not exist.',
    1441: 'Account is inactive. Please contact support.',
    1442: 'Invalid promotion code.',
    1443: 'Promotion code only applicable for new user only.',
    1440: 'User session has expired.',
    1444: 'New session created successfully.',
    1445: 'User initialized successfully.',

    // password messages
    4303: 'New password cannot be the same as the current password.',
    4304: `You must be at least ${minUserAge} years old. Please check your date of birth.`,

    //SystemVariables 
    4305: 'System variables created successfully.',
    4306: 'System variables updated successfully.',
    4307: 'System variables deleted successfully',
    4308: 'System variables already exist.',

    5001: 'Invalid AI token.',
    5002: 'Invalid AI response data or response data was not found.',
    5003: 'Invalid user ID.',

    //VersionUpdate 
    5004: 'Version update created successfully.',
    5005: 'Version update updated successfully.',
    5006: 'Version update deleted successfully.',
    5007: 'Version update platform already exists.',
    5008: 'A version update with this version code already exists.',
    5009: 'Version update details already exist.',
    5109: 'Version details with this platform already exist.',

    5012: 'A college is required to create a premium user account.',
    5011: 'Cannot create premium user as college does not have enough premium users limit.',

    //bulkUser Add 
    5013: 'Import completion result.',
    5014: 'Valid file not found to import users. Please upload a valid .csv (or) .xlsx file.',
    5015: 'Some users already exist in the database and were not re-imported.',
    5016: 'This college does not have enough premium user limits; please purchase more for this college.',

    5017: 'Admin not found.',

    //interviews
    5018: 'Leave cannot be created during the holiday period.',
    5019: 'Leave is already scheduled for this date.',
    5020: 'Availability cannot be created during the holiday period.',
    5021: 'Leave cannot be created during an availability period.',

    5022: 'The selected college is not found in the system.',

    //userAwardGems
    5023: 'User award gems cannot exceed 5000 points.',
    5024: 'User award gems created successfully.',
    5025: 'Unable to save availability.',
    5026: 'Holiday(s) already exist.',
    5027: 'Availability cannot be created during the leave period.',
    5028: 'Notification sent successfully!',
    5029: 'Failed to send OTP.',

    //adminHoliday
    5034: 'Holiday cannot be created during another holiday period.',
    5030: 'Holiday cannot be created during a leave period.',
    5031: 'Holiday cannot be created during an availability period.',

    //adminHoliday
    5032: 'Availability cannot be created during a holiday period.',
    5033: 'Availability cannot be created during another availability period.',

    //admin
    5035: 'Admin updated successfully.',

    5036: "Payment success, but gems not credited due to invalid gems package. Contact support.",
    5037: "Payment success, but gems not credited as payment price and gems package price varies. Contact support.",

    5038: "Leave saved, but some dates skipped due to availablity conflict.",
    5039: "Leave already applied in given date(s).",
    5040: "User not found.",
    5041: "Referral code for user already present.",
    5042: "Assigned referral code to the user.",
    5043: "Availablility present on given date. Please cancel availability and try again",
    5044: "User device ID cleared successfully.",
    5045: "Unable to clear user device ID.",
    5046: "User device ID already cleared or already empty.",
    5047: "Refferal code already applied.",
    5048: "You cannot apply your own referral code.",
    5049: "Invalid referral code.",
    5050: "Could not get the gems details contact support.",
    5051: "You don’t have enough gems to book an interview.",

    //Interview Reviews
    5052: 'User Reviews saved.',
    5053: 'Unable to save Reviews ',

    //Feedback 
    5054: 'Feedback sent successfully.',
    5055: 'Feedback updated successfully.',
    5056: 'Feedback deleted successfully.',
    5057: "Please complete all the units to book a mock interview.",
    5058: 'Please complete first unit to book a mock interview.',
    5099: 'Notification updated successfully.',

    7111: "Config JSON updated successfully.",
    7112: "Mobilecode JSON updated successfully.",
    
    //interviewer
    5100: "User rescheduled successfully.",

    //Institute 
    5101: 'Institute created successfully.',
    5102: 'Institute updated successfully.',
    5103: 'Institute deleted successfully.',
    5104: 'This institute is linked with college. Please unlink it from college to delete.',

    //Promotor
    5105: 'Promotor created successfully.',
    5106: 'Promotor updated successfully.',
    5107: 'Promotor deleted successfully.',
    5110: 'A user with this promo code already exists.',

    //DiceId
    5111: 'Certificate Issued Successfully.',
    5112: 'Failed to Issue certificate. User has not completed all units.'
  }


};
