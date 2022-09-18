const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const fs = require('fs');
const path = require('path');
const upload = require('./common/multer')
const sqip = require('sqip')
const serve = require('koa-static');

const app = new Koa();
const router = new Router();

const home = serve(path.join(__dirname, '/static/'))

router.get('/', (ctx) => {
    ctx.body = fs.readFileSync(path.join(__dirname, '/static/index.html'));
})


router.post('/line', upload.single('file'), async ctx => {
    // upload(ctx.req, ctx.res, function (err) {
    //     if (err instanceof multer.MulterError) {
    //         ctx.body = { code: 1, result: '失败' }
    //     } else if (err) {
    //         ctx.body = { code: 1, result: '失败' }
    //     }
        
    // })
    console.log('ctx.request.file', ctx.request);
    console.log(ctx.request.query.count)
    if (ctx.request.query.count > 2000) {
        ctx.body = { code: 1, data: {}, message: 'count太大了，最多2000' }
    }
    const { final_svg, svg_base64encoded, img_dimensions } = sqip({
        filename: path.join(__dirname, '/static/base/', ctx.request.file.filename),
        numberOfPrimitives: ctx.request.query.count || 200, // 生成 200 个轮廓
        blur: 0
    })

    fs.unlink(path.join(__dirname, '/static/base/', ctx.request.file.filename), (err) => {
        console.log(err);
    });

    ctx.body = { code: 0, data: {svg: { final_svg, svg_base64encoded, img_dimensions }} }
})


app
    // .use(koaBody({
    //     multipart: true,
    //     formidable: {
    //         uploadDir: path.join(__dirname, '/static/base/'),
    //         keepExtensions: true,
    //     }
    // }))
    .use(home)
    .use(cors())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(8000);