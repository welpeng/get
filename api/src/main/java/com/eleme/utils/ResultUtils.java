package com.eleme.utils;


import com.eleme.dto.Result;

/**
 * @author i@huangdenghe.com
 * @date 2017/12/16
 */
public class ResultUtils {

    public static Result success(Object data) {
        Result result = new Result();
        result.setData(data);
        return result;
    }

    public static Result error(int code, String message) {
        return error(code, message, null);
    }

    public static Result error(int code, String message, Object data) {
        Result result = new Result();
        result.setCode(code);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

}
