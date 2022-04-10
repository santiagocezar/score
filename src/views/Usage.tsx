// import { InlineIcon } from 'components/Commons';
import { TextBody } from 'components/TextBody';
import { Title2, Title3 } from 'components/Title';
import { gameModeToName } from 'home/GameCard';

import MdAdd from '~icons/ic/round-add';
import MdBusiness from '~icons/ic/round-business';

export const Usage = () => (
    <TextBody>
        <Title2 id="como-usar">Como usar</Title2>
        <Title3 id="modo-dinero">{gameModeToName.Monopoly}</Title3>
        <p>
            En la pestaña <MdAdd /> puede agregar jugadores, tiene que ingresar el
            nombre junto a un color.
        </p>
        <p>
            Para enviar dinero haga click sobre un jugador y luego sobre otro. El
            primer jugador será el que paga y el segundo el que cobra.
        </p>
        <p>
            En la pestaña <MdBusiness /> puede encontrar una lista con las
            propiedades disponibles en el juego, agrupadas por dueño. Al apretar
            una de estas puede ver información del alquiler y de las casas, así
            como también un botón que dice Transferir, que le permite enviarle
            la propiedad a otro jugador
        </p>
        <Title3>{gameModeToName.Cards}</Title3>
        <p>
            Se encuentra en renovaciones actualmente...
        </p>
        <Title3>{gameModeToName.Bingo}</Title3>
        <p>
            Aprete el botón &quot;Sacar un número&quot; para hacer lo que el botón indica.
            Como alternativa puede apretar la tecla espacio, si le es más cómodo.
        </p>
        <Title2>Condiciones de Uso</Title2>
        <p>
            Desarrollo de carácter educativo.{' '}
            <strong>No se permite el uso para fines lucrativos.</strong> Sin
            ninguna garantía para un propósito en particular.
        </p>
    </TextBody>
);

export default Usage;
