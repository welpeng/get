package com.eleme.entity;

import com.eleme.constant.ReceivingStatus;
import lombok.Data;


import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * @author i@huangdenghe.com
 * @date 2018/03/10
 */
@Data
@Entity
public class Receiving {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String urlKey;
    private String url;
    @Enumerated
    private ReceivingStatus status;
    private BigDecimal price;
    private String message;
    private Timestamp gmtCreate;
    private Timestamp gmtModified;
    private String userId;
    private String date;

}
