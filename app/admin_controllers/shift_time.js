require('../utils/message_code');
require('../utils/error_code');
require('../utils/constants');
require('../utils/push_code');
var utils = require('../utils/utils');
var console = require('../utils/console');
var Shift_time = require('mongoose').model('shift_time');
var mongoose = require('mongoose');


get_monthly_shift_count = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'shift_date', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { shift_date, store_id } = req.body;
            shift_date = new Date(shift_date);

            let store_condition = {
                "$match": { "$and": [{ "store_id": { "$eq":  mongoose.Types.ObjectId(store_id)} }] }
            }

            let group1 = {
                "$group": {
                    _id: { year : "$year" ,month : "$month", day : "$day"},
                    count: { $sum: 1 }
                }
            }


            let group2 = {
                "$group": {
                    _id: {year : "$_id.year" , month : "$_id.month"},
                    day_list: {$push : {day : "$_id.day", count : "$count"} },
                }
            }

            let group3 = {
                "$group": {
                    _id: "$_id.year",
                    month_list: {$push : {month : "$_id.month", day_list : "$day_list"} },
                }
            }

            let sort = { $sort: { _id: 1 } }

            let shift_times = await Shift_time.aggregate([store_condition, group1, group2, group3, sort]);
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
            let { shift_date, store_id } = req.body;
            shift_date = new Date(shift_date);
            let day = shift_date.getDate();
            let month = shift_date.getMonth() + 1;
            let year = shift_date.getFullYear();

            let store_condition = {
                "$match": { "$and": [{ "store_id": { "$eq":  mongoose.Types.ObjectId(store_id)} }] }
            }

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
            let shifts = await Shift_time.aggregate([store_condition, day_condition, vaiter_lookup, vaiter_lookup_array_to_json, project]);
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

get_monthly_total_work_hour = async (req, res) => {
    utils.check_request_params(req.body, [
        { name: 'shift_date', type: 'string' }
    ], async (response) => {
        if (!response.success) {
            res.json(response);
            return;
        }
        try {
            let { shift_date, store_id } = req.body;
            shift_date = new Date(shift_date);
            let month = shift_date.getMonth() + 1;
            let year = shift_date.getFullYear();

            let store_condition = {
                "$match": { "$and": [{ "store_id": { "$eq":  mongoose.Types.ObjectId(store_id)} }] }
            }

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
                    "vaiter_detail.employee_type": 1
                }
            }

            let shifts = await Shift_time.aggregate([store_condition, month_condition, vaiter_lookup, vaiter_lookup_array_to_json, group, project]);
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
