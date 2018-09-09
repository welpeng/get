package com.eleme.service;


import com.eleme.dto.nodejs.RedPacketDTO;
import com.eleme.entity.Alt;
import com.eleme.response.nodejs.HongbaoResponse;

import java.io.IOException;
import java.util.List;

/**
 * @author i@huangdenghe.com
 * @date 2018/03/28
 */
public interface NodejsService {


    HongbaoResponse<RedPacketDTO> getHongbao(String url, String phone,
                                             List<Alt> cookies) throws IOException;

}
