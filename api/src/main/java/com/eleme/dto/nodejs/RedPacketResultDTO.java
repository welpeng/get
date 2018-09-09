package com.eleme.dto.nodejs;

import lombok.Data;

import java.math.BigDecimal;

/**
 * @author i@huangdenghe.com
 * @date 2018/03/13
 */
@Data
public class RedPacketResultDTO {

    private String id;
    private String nickname;
    private BigDecimal price;
    private String date;
}
