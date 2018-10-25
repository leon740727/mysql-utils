"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = require("../index");
describe('condition', () => {
    it('name = ? and id = ?', done => {
        const conds = [
            index_1.Condition.make('name = ?', 'leon'),
            index_1.Condition.make('id = ?', 27),
        ];
        const where = index_1.Condition.whereClause(conds);
        chai_1.expect(where).eql("name = 'leon' and id = 27");
        done();
    });
});
