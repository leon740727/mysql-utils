import { expect } from 'chai';
import { Condition } from '../index';

declare const describe, it;

describe('condition', () => {
    it('name = ? and id = ?', done => {
        const conds = [
            Condition.make('name = ?', 'leon'),
            Condition.make('id = ?', 27),
        ];
        const where = Condition.whereClause(conds);
        expect(where).eql("name = 'leon' and id = 27");
        done();
    });
});
