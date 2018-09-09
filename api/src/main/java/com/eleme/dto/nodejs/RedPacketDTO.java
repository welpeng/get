package com.eleme.dto.nodejs;

import lombok.Data;

import java.util.List;

/**
 * @author i@huangdenghe.com
 * @date 2018/03/13
 */
@Data
public class RedPacketDTO {

    private RedPacketResultDTO result;
    private List<CookieUseStatusDTO> cookies;
    
}
