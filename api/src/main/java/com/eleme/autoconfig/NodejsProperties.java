package com.eleme.autoconfig;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author i@huangdenghe.com
 * @date 2018/07/20
 */

@Component
@ConfigurationProperties(prefix = "com.eleme.api.nodejs")
@Data
public class NodejsProperties {

    /**
     * Node.js 服务的 URL
     */
    private String url;
    /**
     * 校验 cookie 的接口路径
     */
    private String checkCookie;
    /**
     * 领取红包的接口路径
     */
    private String getHongbao;

}
