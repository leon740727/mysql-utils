import { expect } from 'chai';
import { Condition } from '../index';

declare const describe, it;

describe('condition', () => {
    it('name = ? and id = ?', done => {
        const conds = [
            Condition.make('name = ?', ['leon']),
            Condition.make('id = ?', [27]),
        ];
        const where = Condition.whereClause(conds);
        expect(where).eql("name = 'leon' and id = 27");
        done();
    });

    it('name is null', () => {
        const conds = [
            Condition.make('name is ?', [null]),
        ];
        expect(Condition.whereClause(conds)).eql('name is NULL');
    });

    it('"name in ()" should be "1 = 0"', () => {
        const conds = [
            Condition.make('name in (?)', [[]]),
            Condition.make('id = ?', [5]),
        ];
        expect(Condition.whereClause(conds)).eql('1 = 0');
    });

    it('name = ? or name = ?', done => {
        const cond = Condition.make('name = ? or name = ?', ['leon', 'Leon']);
        const where = Condition.whereClause([cond]);
        expect(where).eql("name = 'leon' or name = 'Leon'");
        done();
    });

    it('name in (?) or name in (?) and id in (?)', done => {
        const conds = [
            Condition.make('name in (?) or name in (?)', [['a','a'], ['b', 'b']]),
            Condition.make('id in (?)', [[1,2]]),
        ];
        expect(Condition.whereClause(conds))
        .eql("name in ('a', 'a') or name in ('b', 'b') and id in (1, 2)");
        done();
    });
});
