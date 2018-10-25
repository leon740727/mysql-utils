declare type Primitive = string | number | boolean | Date;
export declare function initdb<T>(dbSetting: any, handler: (conn: any) => Promise<T>): Promise<T>;
export declare class Condition {
    clause: string;
    values?: Primitive[];
    constructor(clause: string, values?: Primitive[]);
    readonly onlyClause: boolean;
    readonly matchNothing: boolean;
    static make(clause: string, values?: Primitive[]): Condition;
    static whereClause(conditions: Condition[]): string;
}
export declare function query(conn: any, sql: string, args: Primitive[]): Promise<[any, any]>;
export declare function update(conn: any, sql: string, arg: any): Promise<number>;
/** 允許 nested transaction。但是內層的 transaction 都不發生作用 */
export declare function beginTx<T>(conn: any, handler: (conn: any) => Promise<T>): Promise<T>;
export {};
