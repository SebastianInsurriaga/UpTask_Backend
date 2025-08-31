import server from './server'
import colors from 'colors'
import swaggerUi from "swagger-ui-express";
import swaggerSpec from './config/swagger';

const port = process.env.PORT || 4000

// Endpoint Swagger
server.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.listen(port, () => {
    console.log(colors.green.bold(`Swagger UI: http://localhost:${port}/docs`));
})