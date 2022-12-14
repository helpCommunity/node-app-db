drop table if exists test_logs;

create table test_logs(uid int not null, event varchar(25) not null, timestamp varchar(25) not null, url varchar(255), tab_id varchar(25) not null);
