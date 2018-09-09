package com.eleme.response;

import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * @author i@huangdenghe.com
 * @date 2018/03/10
 */
@Data
public class ReceivingResponse {

    private Long id;
    private String urlKey;
    private String url;
    private String UserId;
    private BigDecimal price;
    private String message;
    private Timestamp gmtCreate;
    private Timestamp gmtModified;

}
