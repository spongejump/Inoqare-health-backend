const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// These id's and secrets should come from .env file.
const CLIENT_ID =
  "1021091018855-e5dg3pugpp9ni6vd31rr4tennkhko8do.apps.googleusercontent.com";
const CLEINT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04YzzphyW22HwCgYIARAAGAQSNwF-L9Irf6iGZxFTmlwLotBnUpwe9qmbJed7ayXq1VovcTsirG6gj8AAFpISaqByRH6cbZtMtXg";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendEmail = async (options) => {
  console.log("options", options);
  try {
    console.log("try start");
    const accessToken = await oAuth2Client.getAccessToken();
    console.log("accessToken", accessToken);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "contact@inoqare.com",
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    //  console.log("transporter", transporter);
    const message = {
      from: "Inoqare <contact@inoqare.com>",
      to: options.email,
      subject: "Reset Password Requested",
      html: `<!DOCTYPE html 
      PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      
      <head>
         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
         <title>Inoqare</title>
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      
      <body style="margin: 0; padding: 0;">
         <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
               <td>
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="1000"
                     style="border-collapse: collapse; background-color:#f2fcff;">
                     <tbody style="padding: 60px; display: block;">
               
                     <tr>
                        <td >
                           <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                 <td>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                       <tbody border="0" cellpadding="0" cellspacing="0">
                                          <tr>
                                             <td align="center"
                                                style="color: #000; font-family: Arial, sans-serif; font-size: 36px; line-height: 50px; padding-top: 50px; padding-bottom: 50px;">
                                                Hello <span  style="font-weight: 800;">${options?.context?.salutation} 
                                                ${options?.context?.firstName}
                                                ${options?.context?.lasName},</span>  <br/>   
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </td>
                              </tr> 
                           </table>
                        </td>
                     </tr>
                     <tr>
                        <td>
                           <table  width="100%" style="background-color: #fff; padding: 40px;">
                              <tbody>
                                 <tr>
                                    <td>
                                       <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                          <tr>  
                                             <td>
                                              <table width="100%">
                                                 <tbody align="center">
                                                    <tr>
                                                       <td>
                                                          <img src="https://i.postimg.cc/J4CkQxXZ/email.png" alt="img">
                                                       </td>
                                                    </tr>
                                                 </tbody>
                                              </table>
                                             </td>
                                          </tr>
                                          <tr>
                                             <td>
                                                <table width="100%">
                                                   <tbody align="center">
                                                      <tr>
                                                         <td style="color: #000;">
                                                            <p style="font-family: Arial, sans-serif; font-weight: 600; line-height:30px;"> A request has been received to reset  the password for your Inoqare account.</p>
                                                         </td>
                                                      </tr>
                                                   </tbody>
                                                </table>
                                             </td>
                                          </tr>
                                          <tr>
                                             <td>
                                                <table width="100%">
                                                   <tbody align="center">
                                                      <tr>
                                                         <td>
                                                            <a href="${options.context.resetLink}" style="background-color: red; color: #fff;
                                                           padding: 15px 20px; display:inline-flex;  font-family: Arial, sans-serif; font-size:18px; text-decoration: none;">Reset Password</a>
                                                         </td>
                                                      </tr>
                                                   </tbody>
                                                </table>
                                             </td>
                                          </tr>
                                          <tr>
                                             <td>
                                                <table width="100%" >
                                                   <tr>
                                                      <td>
                                                         <hr>
                                                      </td>
                                                   </tr>
                                                </table>
                                             </td>
                                          </tr>
                                          <tr>
                                             <td>
                                                <table width="100%">
                                                   <tbody align="center">
                                                      <tr>
                                                         <td style="color: #000;">
                                                            <p style="font-family: Arial, sans-serif; font-weight: 600; line-height:30px;">If you did not initiate this request,<br> please contact us immediately at contact@inoqare.com<br> or visit us at
                                                                <a href="https://inoqare.com">www.inoqare.com</a></p>
                                                         </td>
                                                      </tr>
                                                   </tbody>
                                                </table>
                                             </td>
                                          </tr>
                                         
                                       </table>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </td>
                     </tr>
             
                  </tbody>
                  </table>
               </td>
            </tr>
         </table>
      </body>
      
      </html>`,
    };

    const info = await transporter.sendMail(message);

    console.log("info", info);

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    return error;
  }
};

module.exports = sendEmail;
