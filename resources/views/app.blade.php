<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <title>Hospital Universitario - Autogestion de turnos</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/autogestion_turnos_hu/public/images/hu_favicon_new.png" type="image/x-icon" />
    


    @routes
    <style>
        body {
            overflow-x: hidden;
        }
    </style>
    @viteReactRefresh
    @vite('resources/js/app.jsx')


</head>

<body>
    <div id="app" data-page='@json($page)'></div>
</body>


</html>
