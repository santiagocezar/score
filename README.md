# <img src="/res/score.svg" height="64" />

Pruébelo en [score.scez.ar](https://score.scez.ar/)!

Un contador de puntos web para tus juegos de mesa.

![screenshot](/res/screenshot.png)
![screenshot](/res/moneyscreenshot.png)

<small>\*propiedades no incluidas</small>

## Dinero

### Uso

En el modo dinero cree un banco y agregue a los jugadores.

Para hacer una transacción haga click en el jugador/banco que entrega el dinero y luego el jugador/banco al que le va a entregar.

### Propiedades

Por precaución, la app no incluye un listado de propiedades. Estas se importan de un archivo JSON con este formato:

```jsonc
{
    "properties": [
        {
            "name": "Casa Blanca", // Nombre de la propiedad
            "cost": 440, // Costo de compra
            "group": "#1111ee", // Color de la propiedad
            // Costo del alquiler en el orden:
            // Sin casa, con casa, 2 casas, 3 casas, 4 casas, y con hotel
            "rent": [50, 120, 250, 400, 810, 1240],
            "house": 200, // Costo de cada casa
            "type": "station", // Opcional, "service" para servicios y "station" para ferrocarriles
            "id": 0 // ID de la propiedad (generalmente el índice del array)
        }
    ]
}
```

Un ejemplo son estas propiedades extraídas de un juego de Monopoly: [hasbro_argentina.json](https://gist.github.com/santiagocezar/0efd9990b17e2db9720c0364dea43f06).

Descargue el archivo, haga clic en importar propiedades y listo.

## Tabla

### Uso

Agregue a un jugador apretando el + en la fila superior. Para sumarle un puntaje apriete el + en la columna bajo el nombre del jugador. En la ultima fila se muestra el puntaje total.

## Bingo

### Uso

Haga clic en el dado para elegir un número aleatorio y marcarlo en la grilla.

# TODO

-   [ ] Color del jugador
-   [ ] Otros modos?
