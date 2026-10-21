const fs = require("fs");
import dayjs from 'dayjs';
import logger from "../logger";
import sendMail from "./sendEmail";
import EncryptUtils from "./encrypt";
import duration from 'dayjs/plugin/duration';
import { TEmailOptions } from "../types/common";
import ResponseModel from "../models/common/responseModel";
import { eDurationType, eReturnCodes } from "../enums/commonEnums";

dayjs.extend(duration);



class CommonUtils {
  /**
   * Returns a ResponseModel object with a specific return code and description.
   * @param {eReturnCodes} returnCode The return code to be used in the response.
   * @returns {ResponseModel} A ResponseModel object with the specified return code and description.
   */
  static getDataResponse(returnCode: eReturnCodes) {
    const responseModel = new ResponseModel(returnCode, new Date(), "No data found");

    switch (returnCode) {
      case eReturnCodes.R_SUCCESS:
        responseModel.description = "Success";
        break;
      case eReturnCodes.R_NOT_FOUND:
        responseModel.description = "Data not found";
        break;
      case eReturnCodes.R_AUTHENTICATION_FAILED:
        responseModel.description = "Authentication failed";
        break;
      case eReturnCodes.R_DB_ERROR:
        responseModel.description = "Database error";
        break;
      case eReturnCodes.R_CREATED:
        responseModel.description = "Data created successfully";
        break;
      case eReturnCodes.R_DUPLICATE_DATA:
        responseModel.description = "Duplicate data found";
        break;
      case eReturnCodes.R_UNAUTHORIZED:
        responseModel.description = "Unauthorized access";
        break;
      default:
        break;
    }
    return responseModel;
  }


  /**
   * Initializes the email with the appropriate content based on the email purpose.
   * This function is called from the services layer to send an email.
   * @param {TEmailOptions} emailOptions The options for the email to be sent.
   * 
   * The email purpose can be one of the following:
   * - SignIn: The email content is set to the SignIn template.
   */
  static initializeEmail(emailOptions: TEmailOptions) {
    switch (emailOptions.emailPurpose) {
      case "SignIn":
        // Read the SignIn HTML template from the assets folder
        fs.readFile(
          "assets/html-template/Welcome.html",
          "utf8",
          (err: any, htmlContent: any) => {
            if (err) {
              console.error("Error reading HTML file:", err);
              // Handle error cases here
              return;
            }
            //console.log("htmlContent", htmlContent);
            htmlContent = htmlContent
              .replace("@EMAIL@", emailOptions.receiverEmail)
              .replace("@PASSWORD@", EncryptUtils.decrypt(emailOptions.password || ""));

            // Create the email options object
            let mailOptions = {
              from: process.env.MAIL_FROM_ADDRESS,
              to: emailOptions.receiverEmail,
              subject: "Welcome",
              html: htmlContent,
            };
            // Send the email
            sendMail(mailOptions, "");
          }
        );
    }
  }

  static async getDuration(startDate: any, endDate: any, durationType: eDurationType, exact = false): Promise<any> {
    let code = 400;
    try {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (!start.isValid() || !end.isValid()) {
        throw new Error('Invalid startDate or endDate');
      }

      const diffMs = Math.abs(end.diff(start));
      const dur = dayjs.duration(diffMs);

      let result: any = '';

      const totalDays = Math.floor(dur.asDays());
      const remainingMsAfterDays = diffMs - dayjs.duration(totalDays, 'days').asMilliseconds();
      const durAfterDays = dayjs.duration(remainingMsAfterDays);

      const totalHours = Math.floor(dur.asHours());
      const remainingMsAfterHours = diffMs - dayjs.duration(totalHours, 'hours').asMilliseconds();
      const durAfterHours = dayjs.duration(remainingMsAfterHours);

      const totalMinutes = Math.floor(dur.asMinutes());
      const remainingMsAfterMinutes = diffMs - dayjs.duration(totalMinutes, 'minutes').asMilliseconds();
      const durAfterMinutes = dayjs.duration(remainingMsAfterMinutes);

      const totalSeconds = Math.floor(dur.asSeconds());

      switch (durationType) {
        case eDurationType.R_DAYS:
          if (exact) {
            result = {
              days: totalDays,
              hours: durAfterDays.hours(),
              minutes: durAfterDays.minutes(),
              seconds: durAfterDays.seconds()
            };
          } else {
            result = { days: totalDays };
          }
          break;

        case eDurationType.R_HOURS:
          if (exact) {
            result = {
              hours: totalHours,
              minutes: durAfterHours.minutes(),
              seconds: durAfterHours.seconds()
            };
          } else {
            result = { hours: totalHours };
          }
          break;

        case eDurationType.R_MINUTES:
          if (exact) {
            result = {
              minutes: totalMinutes,
              seconds: durAfterMinutes.seconds()
            };
          } else {
            result = { minutes: totalMinutes };
          }
          break;

        case eDurationType.R_SECONDS:
          result = { seconds: totalSeconds };
          break;

        case eDurationType.R_ALL:
          result = {
            days: totalDays,
            hours: durAfterDays.hours(),
            minutes: durAfterDays.minutes(),
            seconds: durAfterDays.seconds()
          };
          break;

        default:
          throw new Error('Invalid durationType');
      }

      return { duration: result, code: 200 };

    } catch (error: any) {
      logger.info(`Error Occured in getDuration function in Utils - ${error}`);
      return { message: error.message, code };
    }
  }

}

export default CommonUtils;

      