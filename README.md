# Portfolio-Management
Web app to buy and sell shares

### DBMS Setup
##### Installing MySQL
```
$ sudo apt update
$ sudo apt install mysql-server
```

##### Creating a new user
```MySQL
$ sudo mysql -u root
mysql> CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
mysql> GRANT ALL PRIVILEGES ON * . * TO 'admin'@'localhost';
```

##### Creating the database and tables
Login to mysql as user admin
```
$ mysql -u admin -p
```
Enter password as `admin` <br>
Run all the commands in `/SQL_Queries/DatabaseDefinition.sql` by running
```MySQL
mysql> source /SQL_Queries/DatabaseDefinition.sql
```
Or alternatively copy and paste the commands.
