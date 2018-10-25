"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
function initdb(dbSetting, handler) {
    const conn = mysql.createConnection(dbSetting);
    conn.connect();
    return handler(conn)
        .catch(error => {
        console.log(error);
        conn.end();
        throw error;
    })
        .then(result => {
        conn.end();
        return result;
    });
}
exports.initdb = initdb;
class Condition {
    constructor(clause, values) {
        this.clause = clause;
        this.values = values;
    }
    get onlyClause() {
        return this.values === undefined;
    }
    get matchNothing() {
        return !this.onlyClause &&
            this.clause.match(/ in /) &&
            this.values.length === 0;
    }
    static make(clause, values) {
        return new Condition(clause, values);
    }
    static whereClause(conditions) {
        if (conditions.length === 0) {
            // 查出所有紀錄
            return '1';
        }
        else {
            if (conditions.some(c => c.matchNothing)) {
                // 查不出任何紀錄
                return '1 = 0';
            }
            else {
                const sql = conditions.map(c => c.clause).join(' and ');
                const args = conditions.filter(c => !c.onlyClause)
                    .map(cond => cond.values)
                    .reduce((acc, i) => acc.concat(i));
                return mysql.format(sql, args);
            }
        }
    }
}
exports.Condition = Condition;
function query(conn, sql, arg) {
    return new Promise((resolve, reject) => {
        conn.query(sql, arg, (error, rows, fields) => {
            if (error) {
                reject(error);
            }
            else {
                resolve([rows, fields]);
            }
        });
    });
}
exports.query = query;
function update(conn, sql, arg) {
    return query(conn, sql, arg)
        .then(([result, _]) => result.affectedRows);
}
exports.update = update;
class Conn {
    constructor(conn) {
        this.conn = conn;
    }
    query(sql, arg, cb) {
        this.conn.query(sql, arg, cb);
    }
}
/** 允許 nested transaction。但是內層的 transaction 都不發生作用 */
function beginTx(conn, handler) {
    if (conn instanceof Conn) { // in nested transaction
        return handler(conn);
    }
    else {
        return query(conn, "START TRANSACTION;", null)
            .then(_ => handler(new Conn(conn)))
            .then(result => {
            return query(conn, 'COMMIT;', null)
                .then(_ => result);
        })
            .catch(error => {
            return query(conn, 'ROLLBACK;', null)
                .then(_ => {
                throw error;
            });
        });
    }
}
exports.beginTx = beginTx;
