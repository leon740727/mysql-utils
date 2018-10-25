import mysql = require('mysql');

type Primitive = string | number | boolean | Date;

export function initdb <T> (dbSetting, handler: (conn) => Promise<T>): Promise<T> {
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

export class Condition {
    constructor (public clause: string, public values?: Primitive[]) {}

    get onlyClause (): boolean {
        return this.values === undefined;
    }

    get matchNothing (): boolean {
        return ! this.onlyClause &&
            this.clause.match(/ in /) &&
            this.values.length === 0;
    }

    static make (clause: string, values?: Primitive[]) {
        return new Condition(clause, values);
    }

    static whereClause (conditions: Condition[]): string {
        if (conditions.length === 0) {
            // 查出所有紀錄
            return '1';
        } else {
            if (conditions.some(c => c.matchNothing)) {
                // 查不出任何紀錄
                return '1 = 0';
            } else {
                const sql = conditions.map(c => c.clause).join(' and ');
                const args = conditions.filter(c => ! c.onlyClause)
                    .map(cond => cond.values)
                    .reduce((acc, i) => acc.concat(i));
                return mysql.format(sql, args);
            }
        }
    }
}

export function query (conn, sql: string, args: Primitive[]): Promise<[any, any]> {
    return new Promise((resolve, reject) => {
        conn.query(sql, args, (error, rows, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve([rows, fields]);
            }
        });
    });
}

export function update (conn, sql: string, arg): Promise<number> {
    type Result = {
        affectedRows: number,
    }
    return query(conn, sql, arg)
    .then(([result, _]) => (result as Result).affectedRows);
}

class Conn {
    constructor (private conn) {}
    query (sql: string, args: Primitive[], cb: (error, rows, fields) => any) {
        this.conn.query(sql, args, cb);
    }
}

/** 允許 nested transaction。但是內層的 transaction 都不發生作用 */
export function beginTx <T> (conn, handler: (conn) => Promise<T>): Promise<T> {
    if (conn instanceof Conn) {         // in nested transaction
        return handler(conn);
    } else {
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
