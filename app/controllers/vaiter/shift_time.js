
require('../../utils/message_code');
require('../../utils/error_code');
require('../../utils/constants');
require('../../utils/push_code');
var mongoose = require('mongoose');
var utils = require('../../utils/utils');
var console = require('../../utils/console');
var moment = require('moment');
var Store = require('mongoose').model('store');
var Vaiter = require('mongoose').model('vaiter');
var Shift_time = require('mongoose').model('shift_time');
var emails = require('../../controllers/email_sms/emails');

create_shift = async (req, res) => {
    console.log(req.body)
    utils.check_request_params(req.body, [
        { name: 'vaiter_id', type: 'string' },
        { name: 'vaiter_type_id', type: 'string' },
        { name: 'shift_time_from', type: 'string' },
        { name: 'shift_time_till', type: 'string' },
        { name: 'date_of_shift', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_type_id, server_token, shift_time_from, shift_time_till, date_of_shift } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_type_id);

            //No Vaiter Found
            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let { employee_type, store_id } = vaiter_detail;

            //Server Token
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            //Check for Employee Type
            if (employee_type == VAITER_TYPES.EMPLOYEE) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
                return;
            }

            //Check Date not of Past
            let store = await Store.findById(store_id);

            let [ hour , minutes] = shift_time_from.split(':');
            let nowdate_in_store_time_zone = new Date(moment.utc(utils.get_date_now_at_city(new Date(), store.timezone)));
            let shiftdate = (new Date(date_of_shift)).setHours(hour, minutes, 0 , 0);
            let shift_date_in_store_time_zone = new Date(moment.utc(utils.get_date_now_at_city( shiftdate, store.timezone)));
            console.log(nowdate_in_store_time_zone);
            console.log(shift_date_in_store_time_zone);
            if (shift_date_in_store_time_zone < nowdate_in_store_time_zone) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.INVALID_DATE });
                return;
            }

            //Convert to Store Timezone
            let date_of_shift_in_store_timezone = new Date(moment.utc(utils.get_date_now_at_city(date_of_shift, store.timezone)));

            //Get Month and Year
            let day = date_of_shift_in_store_timezone.getDate();
            let month = date_of_shift_in_store_timezone.getMonth() + 1;
            let year = date_of_shift_in_store_timezone.getFullYear();
            //For Total Time in Hour
            let shift_start_minutes = new Date("01/01/2021 " + shift_time_from).getHours();
            let shift_till_minutes = new Date("01/01/2021 " + shift_time_till).getHours();
            let total_time_in_hour = shift_till_minutes - shift_start_minutes;

            let shift_time = await Shift_time.create(req.body);
            shift_time.timezone = store.timezone;
            shift_time.store_id = store_id;
            shift_time.day = day;
            shift_time.month = month;
            shift_time.year = year;
            shift_time.total_time_in_hour = total_time_in_hour;
            await shift_time.save();
            res.json({ success: true, shift_time: shift_time, message: VAITER_MESSAGE_CODE.ADD_TIME_SHIFT_SUCCESSFULLY })

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.create_shift = create_shift;

get_monthly_shift_count = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'vaiter_id', type: 'string' },
        { name: 'shift_date', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_id, server_token, shift_date } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_id);

            //No Vaiter Found
            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let { employee_type } = vaiter_detail;

            //Server Token
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            //Check for Employee Type
            if (employee_type == VAITER_TYPES.EMPLOYEE) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
                return;
            }

            shift_date = new Date(shift_date);
            let month = shift_date.getMonth() + 1;
            let year = shift_date.getFullYear();

            let month_condition = {
                "$match": { "$and": [{ "month": { "$eq": month } }, { "year": { "$eq": year } }] }
            }


            let group = {
                "$group": {
                    _id: "$day",
                    count: { $sum: 1 }
                }
            }

            let sort = { $sort: { _id: 1 } }

            let shift_times = await Shift_time.aggregate([month_condition, group, sort]);
            if (shift_times.length == 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NO_MONTHLY_SHIFTS_FOUND });
                return;
            }
            res.json({ success: true, shift_times: shift_times, message: VAITER_MESSAGE_CODE.GET_SHIFT_TIME_COUNT_SUCCESSFULLY });

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.get_monthly_shift_count = get_monthly_shift_count;

get_shift_on_specific_day = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'shift_date', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_id, server_token, shift_date } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_id);

            //No Vaiter Found
            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let { employee_type } = vaiter_detail;

            //Server Token
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            //Check for Employee Type
            if (employee_type == VAITER_TYPES.EMPLOYEE) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
                return;
            }

            shift_date = new Date(shift_date);
            let day = shift_date.getDate();
            let month = shift_date.getMonth() + 1;
            let year = shift_date.getFullYear();

            let day_condition = {
                "$match": { "$and": [{ "day": { "$eq": day } }, { "month": { "$eq": month } }, { "year": { "$eq": year } }, { "deleted": { "$eq": false } }] }
            }

            let vaiter_lookup = {
                $lookup: {
                    from: "vaiters",
                    localField: "vaiter_id",
                    foreignField: "_id",
                    as: "vaiter_detail"
                }
            };
            let vaiter_lookup_array_to_json = {
                $unwind: "$vaiter_detail"
            };

            let project = {
                $project:
                {
                    "_id": 1,
                    "unique_id": 1,
                    "shift_time_from": 1,
                    "shift_time_till": 1,
                    "date_of_shift": 1,
                    "vaiter_detail._id": 1,
                    "vaiter_detail.first_name": 1,
                    "vaiter_detail.last_name": 1,
                    "vaiter_detail.email": 1,
                    "vaiter_detail.phone": 1,
                    "vaiter_detail.image_url": 1,
                    "vaiter_detail.employee_type": 1
                }
            }
            let shifts = await Shift_time.aggregate([day_condition, vaiter_lookup, vaiter_lookup_array_to_json, project]);
            if (shifts.length == 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NO_SHIFTS_FOUND_ON_THIS_DAY });
                return;
            }
            res.json({ success: true, shifts: shifts, message: VAITER_MESSAGE_CODE.GET_SHIFTS_SUCCESSFULLY });

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.get_shift_on_specific_day = get_shift_on_specific_day;

update_shift = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'vaiter_id', type: 'string' },
        { name: 'shift_id', type: 'string' },
        { name: 'shift_time_from', type: 'string' },
        { name: 'shift_time_till', type: 'string' },
        { name: 'date_of_shift', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_id, server_token, shift_time_from, shift_time_till, date_of_shift, shift_id } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_id);

            //No Vaiter Found
            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let { employee_type, store_id } = vaiter_detail;

            //Server Token
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            //Check for Employee Type
            if (employee_type == VAITER_TYPES.EMPLOYEE) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
                return;
            }

            //Check Date not of Past
            date_of_shift = new Date(date_of_shift);
            if (date_of_shift <= new Date(Date.now())) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.INVALID_DATE })
            }

            //Get Month and Year
            let day = date_of_shift.getDate();
            let month = date_of_shift.getMonth() + 1;
            let year = date_of_shift.getFullYear();
            //For Total Time in Hour
            let shift_start_minutes = new Date("01/01/2021 " + shift_time_from).getHours();
            let shift_till_minutes = new Date("01/01/2021 " + shift_time_till).getHours();
            let total_time_in_hour = shift_till_minutes - shift_start_minutes;

            let shift_time = await Shift_time.findById(shift_id);
            if (!shift_time) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.SHIFT_TIME_UPDATE_FAILED });
                return;
            }
            shift_time.shift_time_from = shift_time_from;
            shift_time.shift_time_till = shift_time_till;
            shift_time.day = day;
            shift_time.month = month;
            shift_time.year = year;
            shift_time.total_time_in_hour = total_time_in_hour;
            await shift_time.save();
            res.json({ success: true, shift_time: shift_time, message: VAITER_MESSAGE_CODE.UPDATE_SHIFT_SUCCESSFULLY })

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.update_shift = update_shift;


delete_shift = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'vaiter_id', type: 'string' },
        { name: 'shift_id', type: 'string' },
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_id, server_token, shift_id } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_id);

            //No Vaiter Found
            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let { employee_type } = vaiter_detail;

            //Server Token
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            //Check for Employee Type
            if (employee_type == VAITER_TYPES.EMPLOYEE) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
                return;
            }

            let shift_time = await Shift_time.deleteOne({ _id: shift_id });
            if (shift_time.n == 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.DELETE_SHIFT_FAILED });
                return;
            }
            res.json({ success: true, message: VAITER_MESSAGE_CODE.DELETE_SHIFT_SUCCESSFULLY })

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.delete_shift = delete_shift;


get_monthly_total_work_hour = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'shift_date', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_id, server_token, shift_date } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_id);

            //No Vaiter Found
            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let { employee_type } = vaiter_detail;

            //Server Token
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            //Check for Employee Type
            if (employee_type == VAITER_TYPES.EMPLOYEE) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
                return;
            }

            shift_date = new Date(shift_date);
            let month = shift_date.getMonth() + 1;
            let year = shift_date.getFullYear();

            let month_condition = {
                "$match": { "$and": [{ "month": { "$eq": month } }, { "year": { "$eq": year } }, { "deleted": { "$eq": false } }] }
            }

            let vaiter_lookup = {
                $lookup: {
                    from: "vaiters",
                    localField: "vaiter_id",
                    foreignField: "_id",
                    as: "vaiter_detail"
                }
            };
            let vaiter_lookup_array_to_json = {
                $unwind: "$vaiter_detail"
            };

            let group = {
                $group: {
                    _id: "$vaiter_id",
                    total_work_hour: { $sum: "$total_time_in_hour" },
                    vaiter_detail: { $first: "$vaiter_detail" }
                }
            }

            let project = {
                $project:
                {
                    "_id": 0,
                    "total_work_hour": 1,
                    "vaiter_detail._id": 1,
                    "vaiter_detail.first_name": 1,
                    "vaiter_detail.last_name": 1,
                    "vaiter_detail.email": 1,
                    "vaiter_detail.image_url": 1,
                }
            }

            let shifts = await Shift_time.aggregate([month_condition, vaiter_lookup, vaiter_lookup_array_to_json, group, project]);
            if (shifts.length == 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NO_MONTHLY_SHIFTS_FOUND });
                return;
            }
            res.json({ success: true, shifts: shifts, message: VAITER_MESSAGE_CODE.GET_SHIFTS_WORK_HOUR_SUCCESSFULLY });

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.get_monthly_total_work_hour = get_monthly_total_work_hour;


email_preview_monthly_schedule = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'vaiter_id', type: 'string' },
        // { name: 'vaiter_type_id', type: 'string' },
        { name: 'shift_date', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { send_email= false , vaiter_id, server_token, shift_date } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_id);

            //No Vaiter Found
            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let { employee_type } = vaiter_detail;

            //Server Token
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            //Check for Employee Type
            // if (employee_type == VAITER_TYPES.EMPLOYEE) {
            //     res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
            //     return;
            // }

            shift_date = new Date(shift_date);
            let month = shift_date.getMonth() + 1;
            let year = shift_date.getFullYear();

            let month_condition = {
                "$match": {
                    "$and": [
                        { "month": { "$eq": month } },
                        { "year": { "$eq": year } },
                        { "deleted": { "$eq": false } },
                        { "vaiter_id": { "$eq": mongoose.Types.ObjectId(vaiter_id) } },
                    ]
                }
            };

            let group = {
                $group: {
                    _id: "$date_of_shift",
                    shift_time_from: { $first: "$shift_time_from" },
                    shift_time_till: { $first: "$shift_time_till" },
                    total_work_hour: { $first: "$total_time_in_hour" },
                }
            };

            let project = {
                $project:
                {
                    "_id": 0,
                    "date": { $dateToString: { format: "%d-%m-%Y", date: "$_id" } },
                    "shift_time_from": 1,
                    "shift_time_till": 1,
                    "total_work_hour": 1,
                }
            };

            let sort = {
                $sort: {
                    "date": 1
                }
            }

            let shifts = await Shift_time.aggregate([month_condition, group, project, sort]);
            if (shifts.length == 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NO_MONTHLY_SHIFTS_FOUND });
                return;
            }
            
            res.json({ success: true, shifts: shifts, message: VAITER_MESSAGE_CODE.GET_EMAIL_PREVIEW_SCHEDULE_SUCCESSFULLY });

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.email_preview_monthly_schedule = email_preview_monthly_schedule;

email_monthly_schedule = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'vaiter_id', type: 'string' },
        { name: 'vaiter_type_id', type: 'string' },
        { name: 'shift_date', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { vaiter_type_id, vaiter_id, server_token, shift_date } = req.body;
            let vaiter_detail = await Vaiter.findById(vaiter_type_id);

            //No Vaiter Found
            if (!vaiter_detail) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }

            let vaiter = await Vaiter.findById(vaiter_id);
            if (!vaiter) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_A_REGISTERED });
                return;
            }
            let { employee_type } = vaiter_detail;

            //Server Token
            if (!server_token || vaiter_detail.server_token != server_token) {
                res.json({ success: false, error_code: ERROR_CODE.INVALID_SERVER_TOKEN });
                return;
            }

            //Check for Employee Type
            if (employee_type == VAITER_TYPES.EMPLOYEE) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.NOT_AUTHORIZED });
                return;
            }

            

            shift_date = new Date(shift_date);
            let month = shift_date.getMonth() + 1;
            let year = shift_date.getFullYear();

            let month_condition = {
                "$match": {
                    "$and": [
                        { "month": { "$eq": month } },
                        { "year": { "$eq": year } },
                        { "deleted": { "$eq": false } },
                        { "vaiter_id": { "$eq": mongoose.Types.ObjectId(vaiter_id) } },
                    ]
                }
            };

            let group = {
                $group: {
                    _id: "$date_of_shift",
                    shift_time_from: { $first: "$shift_time_from" },
                    shift_time_till: { $first: "$shift_time_till" },
                    total_work_hour: { $first: "$total_time_in_hour" },
                }
            };

            let project = {
                $project:
                {
                    "_id": 0,
                    "date": { $dateToString: { format: "%d-%m-%Y", date: "$_id" } },
                    "shift_time_from": 1,
                    "shift_time_till": 1,
                    "total_work_hour": 1,
                }
            };

            let sort = {
                $sort: {
                    "date": 1
                }
            }

            let shifts = await Shift_time.aggregate([month_condition, group, project, sort]);
            if (shifts.length == 0) {
                res.json({ success: false, error_code: VAITER_ERROR_CODE.SHEDULE_EMAIL_SENT_FAILED });
                return;
            }

            let extra_param_for_email = {
                shifts : shifts,
                month_name : MONTH[month-1]
            }
            emails.sendVaiterMonthSchedule(req , vaiter , extra_param_for_email);
            res.json({ success: true, message: VAITER_MESSAGE_CODE.EMAIL_SCHEDULE_SENT_SUCCESSFULLY });

        } catch (error) {
            console.log(error);
            res.json({
                success: false,
                error_code: ERROR_CODE.SOMETHING_WENT_WRONG
            });
        }
    });
};
module.exports.email_monthly_schedule = email_monthly_schedule;