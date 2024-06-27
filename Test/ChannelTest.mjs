// npm install --save-dev mocha
import assert from 'assert';

// get database
import { dbHandler} from "../DB/DatabaseHandler.mjs";


// Caso de prueba 1: Ingresar user_id vacío.
describe('#get_channels_by_user_id() - Caso de prueba 1', function() {
  it('Manejar un user_id vacío', async function () 
  {
    try {
      await dbHandler.get_channels_by_user_id("", 20);
    }
    catch (error) {
      // error lanzado, prueba pasada
      console.log(error.message);
      return;
    }

    assert.fail('Se esperaba que la función lanzara un error indicando user_id vacío');
  });
});



// Caso de prueba 2: user_id válido pero count -1
describe('#get_channels_by_user_id() - Caso de prueba 2', function() {
  it('Manejar un count negativo', async function () {
    const valid_user_id = "66406fd24dfba48f2ca9889a";
    
    try {
      await dbHandler.get_channels_by_user_id(valid_user_id, -1);
    }
    catch (error) {
      // error lanzado, prueba pasada
      console.log(error.message);
      return;
    }

    assert.fail('Se esperaba que la función lanzara un error indicando count negativo');
  });
});


// Caso de prueba 3: Enviar un usuario válido
describe('#get_channels_by_user_id() - Caso de prueba 3', function() {
  it('Obtener lista de canales de un usuario válido', async function () {
    const valid_user_id = "66406fd24dfba48f2ca9889a";
    const result = await dbHandler.get_channels_by_user_id(valid_user_id, 20);
    assert(Array.isArray(result), 'El resultado no es una lista de canales');
  });
});
