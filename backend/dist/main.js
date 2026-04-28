"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Smart To-Do API')
        .setDescription('AI-powered task management')
        .setVersion('1.0')
        .build();
    swagger_1.SwaggerModule.setup('api', app, swagger_1.SwaggerModule.createDocument(app, config));
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map