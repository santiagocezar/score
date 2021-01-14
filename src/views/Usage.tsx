import { InlineIcon } from 'components/Commons';
import TextBody from 'components/TextBody';
import React, { ReactNode } from 'react';

export const Usage = () => (
    <TextBody style={{ maxWidth: '512px' }}>
        <h1 id="como-usar">Como usar</h1>
        <h2 id="modo-dinero">Modo Dinero</h2>
        <p>
            Presione <em>Add</em> para agregar un banco o jugadores.
            <br />
            Para hacer una transacción haga click en un la entidad que entrega
            el dinero y luego la que lo recibe.
            <InlineIcon name="restore_page" />
            para empezar un nuevo juego.
        </p>
        <h2 id="modo-tabla">Modo Tabla</h2>
        <p>
            Agregue a un jugador apretando el
            <InlineIcon name="add" />
            en la fila superior. Para sumarle un puntaje apriete
            <InlineIcon name="add" />
            en la columna bajo el nombre del jugador. En la ultima fila se
            muestra el puntaje total.
        </p>
        <h2 id="modo-bingo">Modo Bingo</h2>
        <p>
            Haga clic en
            <InlineIcon name="casino" />
            para elegir un número aleatorio y marcarlo en la grilla.
            <InlineIcon name="restore_page" />
            para limpiar la grilla.
        </p>
        <h1 id="condiciones-de-uso">Condiciones de Uso</h1>
        <p>
            Desarrollo de carácter educativo.{' '}
            <strong>No se permite el uso para fines lucrativos.</strong> Sin
            ninguna garantía para un propósito en particular.
        </p>
    </TextBody>
);

export default Usage;
