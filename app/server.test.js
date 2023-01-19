'use strict';

const server    = require('./server');
const supertest = require('supertest');
const request   = supertest(server);

describe('Test endpoint health', () => {
    it('should get a health', async () => {
        let res = await request.get('/v1/health');
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.text).success).toBe(true);
    });
});