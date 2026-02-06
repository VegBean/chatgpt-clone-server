CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户唯一主键ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（登录/展示用）',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '用户邮箱（唯一，用于登录/找回密码）',
  `password` VARCHAR(100) NOT NULL COMMENT '密码（加密存储，如BCrypt/SHA256）',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间（用户注册时间）',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间（用户信息修改时间）',
  PRIMARY KEY (`id`),
  INDEX `idx_user_email` (`email`) -- 邮箱索引，提升登录查询效率
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话应用-用户表';

CREATE TABLE `chat_session` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会话唯一主键ID',
  `user_id` BIGINT NOT NULL COMMENT '关联用户ID（归属哪个用户的会话）',
  `session_name` VARCHAR(100) DEFAULT '' COMMENT '会话名称',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '会话状态（1：正常，0：已删除（软删除），可选）',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '会话创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '会话更新时间（最后一条消息发送时间）',
  PRIMARY KEY (`id`),
  INDEX `idx_session_user_id` (`user_id`) -- 按用户查询会话，提升效率
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话应用-会话表';

CREATE TABLE `chat_message` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息唯一主键ID',
  `role` VARCHAR(20) NOT NULL COMMENT '消息角色（user：用户，assistant：AI助手）',
  `parts` JSON NOT NULL COMMENT '消息内容（适配mock数据格式，存储文本/后续可扩展图片等）',
  `session_id` BIGINT NOT NULL COMMENT '关联会话ID（归属哪个会话的消息）',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '消息创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '消息更新时间（极少修改，主要用于日志）',
  PRIMARY KEY (`id`),
  INDEX `idx_message_session_id` (`session_id`), -- 按会话查询消息，核心索引
  INDEX `idx_message_create_time` (`create_time`) -- 按时间排序查询，提升效率
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话应用-对话消息表';