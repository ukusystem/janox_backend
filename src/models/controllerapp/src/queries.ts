import { IntTuple } from './intTuple';
import { ParseType } from './enums';
import * as Codes from './codes';
import { TableTuple } from './tableTuple';
import * as queries from './queries';

/**
 * Append a {@linkcode tuplePassword} to the provided list of
 * {@linkcode IntTuple}. Used to build a list of parameters that expect a password
 * at the end.
 *
 * @param parseList List of current tuples.
 * @return The complete list of tuples
 */
export function addPasswordTuple(parseList: IntTuple[]): IntTuple[] {
  const newList: IntTuple[] = [];
  for (const item of parseList) {
    newList.push(item);
  }
  newList.push(queries.tuplePassword);
  return newList;
}

export const DEFAULT_DATE = '2000-01-01 00:00:00';

/* Constants for parsing commands */

export const tupleInt = new IntTuple(ParseType.TYPE_INT, Codes.ERR_NO_INT);
export const tupleBig = new IntTuple(ParseType.TYPE_BIG, Codes.ERR_NO_BIG);
export const tupleLong = new IntTuple(ParseType.TYPE_LONG, Codes.ERR_NO_LONG);
export const tupleFloat = new IntTuple(ParseType.TYPE_FLOAT, Codes.ERR_NO_FLOAT);
export const tupleUser = new IntTuple(ParseType.TYPE_STR, Codes.ERR_NO_USER);
export const tuplePassword = new IntTuple(ParseType.TYPE_STR, Codes.ERR_NO_PASSWORD);
export const tupleCmd = new IntTuple(ParseType.TYPE_INT, Codes.ERR_NO_CMD);
export const tupleID = new IntTuple(ParseType.TYPE_INT, Codes.ERR_NO_ID);
export const tupleValue = new IntTuple(ParseType.TYPE_INT, Codes.ERR_NO_VALUE);
export const tupleTxt = new IntTuple(ParseType.TYPE_STR, Codes.ERR_NO_TXT);

export const loginParse = [tupleUser, tuplePassword, tupleInt, tupleInt, tupleInt];
export const valueDateParse = [tupleValue, tupleLong];
export const cmdAndIDParse = [tupleInt, tupleCmd];
export const tempParse = [tupleID, tupleFloat];
export const IDTextParse = [tupleValue, tupleTxt];
export const valueParse = [tupleValue];
export const bigParse = [tupleBig];
export const longParse = [tupleLong];
export const idParse = [tupleID];
export const pinStateParse = [tupleID, tupleInt];
export const enablesParse = [tupleInt, tupleBig, tupleInt, tupleBig, tupleInt, tupleBig, tupleInt, tupleBig, tupleBig, tupleBig];

export const pinParse = [tupleInt, tupleInt, tupleLong, tupleInt];
export const cardReadParse = [tupleInt, tupleBig, tupleInt, tupleInt, tupleInt, tupleLong];
export const powerParse = [tupleLong, tupleID, tupleFloat, tupleFloat, tupleFloat, tupleFloat, tupleFloat, tupleFloat];
export const orderParse = [tupleInt, tupleInt, tupleLong];
export const securityStateParse = [tupleInt, tupleInt, tupleInt, tupleLong];
export const sdStateParse = [tupleInt, tupleInt, tupleInt, tupleLong];
export const authParse = [tupleInt, tupleInt, tupleLong];
export const alarmParse = [tupleInt, tupleFloat, tupleLong];

/* General configuration */

export const generalSelect = `
				SELECT nombreempresa, celular, com FROM general.configuracion WHERE conf_id=1 LIMIT 1;
`;

export const generalUpdate = `
				UPDATE general.configuracion
				SET nombreempresa=?, celular=?, com=? WHERE conf_id=1;
`;

// export const generalSelectConfigForGSM = `
// 				SELECT celular, com FROM general.configuracion WHERE conf_id=1 LIMIT 1;
// `;

export const selectCelular = `
				SELECT celular AS entero FROM general.configuracion WHERE conf_id=1 LIMIT 1;
`;

export const selectCOM = `
				SELECT com AS text FROM general.configuracion WHERE conf_id=1 LIMIT 1;
`;

/* Manage tables */

export const createDatabase = `
				CREATE DATABASE IF NOT EXISTS %s
			`;

/* Events */

export const insertPower = `
                INSERT INTO %s.registroenergia (me_id, voltaje, amperaje, fdp, frecuencia, potenciaw, potenciakwh, fecha) 
                VALUES (?,?,?,?,?,?,?,?);
            `;

export const updatePower = `
				UPDATE %s.medidorenergia
				SET voltaje=?, amperaje=?, fdp=?, frecuencia=?, potenciaw=?, potenciakwh=?
				WHERE me_id = ?;
			`;

export const updateEnergyEnable = `
				UPDATE %s.medidorenergia
				SET activo = ?
				WHERE me_id = ?;
			`;

export const updateInputEnable = `
				UPDATE %s.pinesentrada
				SET activo = ?
				WHERE pin = ?;
			`;

export const updateOutputEnable = `
				UPDATE %s.pinessalida
				SET activo = ?
				WHERE pin = ?
			`;

export const updateTemperatureSensorEnable = `
				UPDATE %s.sensortemperatura
				SET activo =?
				WHERE st_id = ?
			`;

/**
 * This sets all rows with one query. Currently not defined, maybe not possible?
 */
export const updateAllInputsEnables = `

			`;

export const insertCard = `
				INSERT INTO %s.registroacceso (serie, administrador, autorizacion, fecha, p_id, ea_id, tipo, sn_id)
				VALUES (?,?,?,?,?,?,?,?);
			`;

export const getCardInfo = `
				SELECT A.p_id, A.ea_id
				FROM general.acceso A
				JOIN general.personal P
				ON A.p_id = P.p_id
				WHERE A.serie = ?
				AND P.co_id = ?;
			`;

export const insertCtrlState = `
				UPDATE general.controlador
				SET conectado = ?
				WHERE ctrl_id=?;
			`;

export const insertNet = `
				INSERT INTO general.registrored ( ctrl_id, fecha, estado )
				VALUE (?, ?, ?);
			`;

export const securityUpdate = `
				UPDATE general.controlador
				SET seguridad=?
				WHERE ctrl_id=?;
			`;

export const modeUpdate = `
				UPDATE general.controlador
				SET modo=?
				WHERE ctrl_id=?;
			`;

export const insertSecurity = `
				INSERT INTO %s.registroseguridad ( estado, fecha) VALUE (?, ?);
			`;

export const insertTemperature = `
				INSERT INTO %s.registrotemperatura (st_id, valor, fecha)
				VALUES (?, ?, ?);
			`;

export const updateAddress = `
				UPDATE %s.sensortemperatura
				SET serie = ?
				WHERE st_id = ?;
			`;

export const updateAlarmThreshold = `
				UPDATE %s.sensortemperatura
				SET umbral_alarma = ?
				WHERE st_id = ?;
			`;

export const insertInputChanged = `
				INSERT INTO %s.registroentrada (pin, estado, fecha, ee_id)
				VALUES (?, ?, ?, (SELECT ee_id FROM %s.pinesentrada WHERE pin=?));
			`;

export const insertOutputChanged = `
				INSERT INTO %s.registrosalida (pin, estado, fecha, es_id, alarma)
				VALUES (?, ?, ?, (SELECT es_id FROM %s.pinessalida WHERE pin=?), ?);
			`;

export const updateInputState = `
				UPDATE %s.pinesentrada
				SET estado=?
				WHERE pe_id = ?;
			`;

export const updateOutputState = `
				UPDATE %s.pinessalida
				SET estado=?
				WHERE ps_id = ?;
			`;

export const getDetectorID = `
				SELECT ee_id AS device_id
				FROM %s.pinesentrada
				WHERE pin=?;
			`;

export const getActuatorID = `
				SELECT es_id AS device_id
				FROM %s.pinessalida
				WHERE pin=?;
			`;

export const insertSD = `
				INSERT INTO %s.registromicrosd (fecha, estd_id)
				VALUE (?, ?);
			`;

export const insertCameraState = `
				INSERT INTO %s.registroestadocamara (cmr_id, fecha, conectado)
				VALUE (?,?,?)
			`;

/* Tickets and requests */

/**
 * Update the ticket as attended
 */
export const updateTicketAttended = `
				UPDATE %s.registroticket
				SET asistencia = 1
				WHERE rt_id = ?;
`;

/**
 * Select the ticket that is being attended
 */
export const selectTicketToAttend = `
				SELECT rt_id FROM %s.registroticket
				WHERE co_id = ? AND fechacomienzo < ? AND fechatermino > ? AND enviado = 1;
`;

export const insertRequest = `
				INSERT INTO %s.registropeticion ( pin, orden, fecha, estd_id, acceso_remoto)
				VALUE (?, ?, ?, ?, ?);
			`;

export const insertTicket = `
				INSERT INTO %s.registroticket
				(telefono, correo, descripcion, fechacomienzo, fechatermino,
				estd_id, fechacreacion, prioridad, p_id, tt_id,
				sn_id, co_id, enviado, asistencia)
				VALUE
				(?, ?, ?, ?, ?,
				?, ?, ?, ?,	?,
				?, ?, 0 , 0);
			`;

export const getCompanyID = `
				SELECT contrata_id FROM %s.registroticket
				WHERE id=?;
			`;

export const finishTicket = `
				UPDATE %s.registroticket
				SET estd_id=?, fechaestadofinal=?
				WHERE rt_id=?;
			`;

export const ticketSetSent = `
				UPDATE %s.registroticket
				SET enviado = 1
				WHERE rt_id = ?;
			`;

export const insertWorker = `
				INSERT INTO %s.actividadpersonal (nombre, apellido, telefono, dni, c_id, co_id, rt_id, foto)
				VALUE (?, ?, ?, ?, ?, ?, ?, ?);
			`;

/**
 * Removed:
 * WHERE enviado=0
 * So newly installed controllers (replacing the one that had the ticket) can be updated with valid tickets.
 */
export const ticketSelectAccepted = `
				SELECT rt_id, co_id, fechacomienzo, fechatermino
				FROM %s.registroticket
				WHERE fechatermino > now()
				AND estd_id = (
					SELECT estd_id
					FROM general.estado
					WHERE estado='Aceptado'
				) ORDER BY fechacomienzo ASC;
			`;

export const ticketSelectOne = `
				SELECT co_id, fechacomienzo, fechatermino, estd_id
				FROM %s.registroticket
				WHERE rt_id=?;
			`;

export const insertDocument = `
				INSERT INTO %s.archivoticket ( ruta, nombreoriginal, tipo, rt_id, tamaño, thumbnail) VALUE (?, ?, ?, ?, ?, ?);
			`;

/* Common queries */

/**
 * Get the next ID that would be used in the next row inserted in a table in the
 * 'general' database. Needs to be formated with the table's name.
 */
export const nextIDForGeneral = `
				SELECT AUTO_INCREMENT
				FROM information_schema.tables
				WHERE table_name = '%s'
				AND table_schema = 'general';
			`;

// export const nextIDForGeneral2 = `
// 				SELECT *
// 				FROM information_schema.tables
// 				;
// 			`;

/**
 * Get the next ID that would be used in the next row inserted in a table in the
 * node's database. Needs to be formated with the table's name and the node
 * database name.
 */
export const nextIDForNode = `
				SELECT AUTO_INCREMENT
				FROM information_schema.tables
				WHERE table_name = '%s'
				AND table_schema = '%s';
			`;

/*
 * Set the cache expiration delay for the current session so it updates on every
 * operation.
 */
export const setStatExpiry = `
				SET information_schema_stats_expiry = 0;
			`;

/* Login */

export const loginManager = `
				SELECT u_id, contraseña FROM general.usuario
				WHERE usuario=?
				AND activo=1
				AND rl_id=(
				SELECT rl_id FROM general.rol
				WHERE rol='Administrador');
			`;

/* Region */

export const regionSelect = `
				SELECT rgn_id, region, descripcion
				FROM general.region
				WHERE activo = 1;
			`;

export const regionInsert = `
				INSERT INTO general.region (rgn_id, region, descripcion, activo)
				VALUE (?, ?, ?, 1);
			`;

export const regionUpdate = `
				UPDATE general.region
				SET region=?, descripcion=?
				WHERE rgn_id=?;
			`;

export const regionDisable = `
				UPDATE general.region
				SET activo=0
				WHERE rgn_id=?;
			`;

export const regionParse = [tupleInt, tupleTxt, tupleTxt];

/* Node */

export const nodeGetForSocket = `
				SELECT ctrl_id, nodo, ip, puerto, usuario, contraseña, celular
				FROM general.controlador
				WHERE activo=1;
			`;

export const nodeGetForUpdate = `
				SELECT ctrl_id, nodo, ip, puerto, usuario, contraseña
				FROM general.controlador
				WHERE ctrl_id=? AND activo=1;
			`;

/**
 * ctrl_id, nodo, rgn_id, direccion, descripcion,
 * latitud, longitud, usuario, serie,
 * ip, mascara, puertaenlace, puerto, personalgestion,
 * personalimplementador, seguridad,
 *
 * motionrecordseconds, res_id_motionrecord, motionrecordfps,
 * motionsnapshotseconds, res_id_motionsnapshot, motionsnapshotinterval,
 * res_id_streamprimary, streamprimaryfps,
 * res_id_streamsecondary, streamsecondaryfps,
 * res_id_streamauxiliary, streamauxiliaryfps, celular
 * modo,
 */

export const nodeSelect = `
				SELECT ctrl_id, nodo, rgn_id, direccion, descripcion,
					latitud, longitud, usuario, serie,
					ip, mascara, puertaenlace, puerto, personalgestion,
					personalimplementador, seguridad,
					
					motionrecordseconds, res_id_motionrecord, motionrecordfps, 
					motionsnapshotseconds, res_id_motionsnapshot, motionsnapshotinterval, 
					res_id_streamprimary, streamprimaryfps, 
					res_id_streamsecondary, streamsecondaryfps, 
					res_id_streamauxiliary, streamauxiliaryfps,
					modo, celular

				FROM general.controlador
				WHERE activo=1;
			`;

/**
 * Update the node data without modifying the password.
 */
export const nodeUpdate = `
				UPDATE general.controlador
				SET nodo=?, rgn_id=?, direccion=?, descripcion=?,
					latitud=?, longitud=?, usuario=?,
					ip=?, mascara=?, puertaenlace=?, puerto=?, personalgestion=?,
					personalimplementador=?,

					motionrecordseconds=?, res_id_motionrecord=?, motionrecordfps=?, 
					motionsnapshotseconds=?, res_id_motionsnapshot=?, motionsnapshotinterval=?, 
					res_id_streamprimary=?, streamprimaryfps=?, 
					res_id_streamsecondary=?, streamsecondaryfps=?, 
					res_id_streamauxiliary=?, streamauxiliaryfps=?, celular=?
					
				WHERE ctrl_id=?;
			`;

/**
 * Update the node data modifying the password. The password must be already
 * encrypted.
 */
export const nodeUpdatePwd = `
				UPDATE general.controlador
				SET nodo=?, rgn_id=?, direccion=?, descripcion=?,
					latitud=?, longitud=?, usuario=?,
					ip=?, mascara=?, puertaenlace=?, puerto=?, personalgestion=?,
					personalimplementador=?, 

					motionrecordseconds=?, res_id_motionrecord=?, motionrecordfps=?, 
					motionsnapshotseconds=?, res_id_motionsnapshot=?, motionsnapshotinterval=?, 
					res_id_streamprimary=?, streamprimaryfps=?, 
					res_id_streamsecondary=?, streamsecondaryfps=?, 
					res_id_streamauxiliary=?, streamauxiliaryfps=?, celular=?,

					contraseña=?
				WHERE ctrl_id=?;
			`;

export const nodeUpdateTrivial = `
			UPDATE general.controlador
			SET nodo=?, rgn_id=?, direccion=?, descripcion=?,
				latitud=?, longitud=?,
				personalgestion=?,
				personalimplementador=?,

				motionrecordseconds=?, res_id_motionrecord=?, motionrecordfps=?, 
				motionsnapshotseconds=?, res_id_motionsnapshot=?, motionsnapshotinterval=?, 
				res_id_streamprimary=?, streamprimaryfps=?, 
				res_id_streamsecondary=?, streamsecondaryfps=?, 
				res_id_streamauxiliary=?, streamauxiliaryfps=?, celular=?
			WHERE ctrl_id=?;
		`;

export const nodeUpdateSerial = `
			UPDATE general.controlador
			SET serie=?
			WHERE ctrl_id=?;
`;

export const nodeInsert = `
				INSERT INTO general.controlador (
					ctrl_id, nodo, rgn_id, direccion, descripcion, latitud, longitud,
					usuario, ip, mascara, puertaenlace, puerto, personalgestion,
					personalimplementador,

					motionrecordseconds, res_id_motionrecord, motionrecordfps, 
					motionsnapshotseconds, res_id_motionsnapshot, motionsnapshotinterval, 
					res_id_streamprimary, streamprimaryfps, 
					res_id_streamsecondary, streamsecondaryfps, 
					res_id_streamauxiliary, streamauxiliaryfps, celular,

					contraseña, modo, seguridad, conectado, activo, serie)
				VALUE (
					?, ?, ?, ?, ?, ?, ?,
					?, ?, ?, ?, ?, ?,
					?,

					?, ?, ?,
					?, ?, ?,
					?, ?,
					?, ?,
					?, ?, ?,

					?, 0, 0, 0, 1, '-')
			`;

export const nodeDisable = `
				UPDATE general.controlador
				SET activo=0
				WHERE ctrl_id=?;
			`;

/**
ID,
Name, Group, Address, Description,
Latitude, Longitude, User,
IP, Mask, Gateway, Port, Person1,
Person2,

RecordDuration, RecordResolution, RecordFPS,
SnapDuration, SnapResolution, SnapInterval,
PrimaryResolution, PrimaryFPS,
SecondaryResolution, SecondaryFPS,
AuxiliaryResolution, AuxiliaryFPS,
Cellphone
 */
export const indexForTrivial = [0, 1, 2, 3, 4, 5, 6, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];

export const nodeSelectID = `
				SELECT ctrl_id AS entero FROM general.controlador
				WHERE activo=1;
			`;

/**
 * Tuples to parse the node data without a password.
 */
export const nodeParse = [tupleID, tupleTxt, tupleID, tupleTxt, tupleTxt, tupleTxt, tupleTxt, tupleTxt, tupleTxt, tupleTxt, tupleTxt, tupleInt, tupleTxt, tupleTxt, tupleInt, tupleID, tupleInt, tupleInt, tupleID, tupleInt, tupleID, tupleInt, tupleID, tupleInt, tupleID, tupleInt, tupleInt];

/**
 * Tuples to parse the node data expecting a password as the last item.
 */
export const nodeParsePwd = addPasswordTuple(nodeParse);

export const nodePasswordIndex = nodeParsePwd.length - 1;

export const nodeNameIndex = 2;

/* Company */

export const companyInsert = `
				INSERT INTO general.contrata (co_id, contrata, r_id, descripcion, activo)
				VALUE (?, ?, ?, ?, 1);
			`;

export const companyUpdate = `
				UPDATE general.contrata
				SET contrata=?, r_id=?, descripcion=?
				WHERE co_id=?;
			`;

export const companyDisable = `
				UPDATE general.contrata
				SET activo=0
				WHERE co_id=?;
			`;

/* Worker */

export const selectWorkerCompany = `
	SELECT co_id AS entero FROM general.personal
	WHERE p_id = ?;
`;

export const workerParse = [tupleID, tupleTxt, tupleTxt, tupleTxt, tupleTxt, tupleInt, tupleInt, tupleTxt, tupleTxt];

export const workerPhotoIndex = 8;
export const workerIDIndex = 0;

/* Card */

export const cardUpdate = `
				UPDATE general.acceso
				SET serie=?, administrador=?, p_id=?, ea_id=?, activo=?
				WHERE a_id=?;
			`;

export const cardDisable = `
				UPDATE general.acceso
				SET activo=0
				WHERE a_id=?;
			`;

export const cardParse = [tupleInt, tupleBig, tupleInt, tupleInt, tupleInt, tupleInt];

export const cardSelectForController = `
				SELECT A.a_id, A.serie, A.administrador, P.co_id, A.activo
				FROM general.acceso A
				JOIN general.personal P
				ON A.p_id = P.p_id;
			`;

/* Energy */

export const energySelect = `
			SELECT me_id, descripcion
			FROM %s.medidorenergia;
			`;

export const energyUpdate = `
			UPDATE %s.medidorenergia
			SET descripcion =?
			WHERE me_id = ?;
			`;

export const energyParse = [tupleInt, tupleTxt];

/* Fixed lists (edition is not allowed by manager) */

export const sectorSelect = `
				SELECT r_id, rubro FROM general.rubro;
			`;

export const actuatorSelect = `
				SELECT es_id, actuador, descripcion FROM general.equiposalida WHERE activo=1;
			`;

export const detectorSelect = `
				SELECT ee_id, detector, descripcion FROM general.equipoentrada WHERE activo=1;
			`;

export const cameraTypeSelect = `
				SELECT tc_id, tipo FROM general.tipocamara;
			`;

export const camBrandSelect = `
				SELECT m_id, marca FROM general.marca;
			`;

export const selectResolutions = `
				SELECT res_id, nombre FROM general.resolucion;
			`;

/* Input pins */

export const inputsSelect = `
				SELECT pe_id, pin, ee_id, descripcion
				FROM %s.pinesentrada;
			`;

export const inputUpdate = `
				UPDATE %s.pinesentrada
				SET pin=?, ee_id=?, descripcion=?
				WHERE pe_id=?;
			`;

export const inputParse = [tupleInt, tupleInt, tupleInt, tupleTxt];

/* Output pins */

export const outputsSelect = `
				SELECT ps_id, pin, es_id, descripcion
				FROM %s.pinessalida;
			`;

export const outputUpdate = `
				UPDATE %s.pinessalida
				SET pin=?, es_id=?, descripcion=?
				WHERE ps_id=?;
			`;

export const outputParse = [tupleInt, tupleInt, tupleInt, tupleTxt];

/* Cameras */

export const camerasSelect = `
				SELECT cmr_id, serie, tc_id, m_id, usuario, ip, puerto, descripcion, puertows, mascara, puertaenlace
				FROM %s.camara
				WHERE activo=1;
			`;

export const nodeSelectForCameraCheck = `
				SELECT ctrl_id AS entero
				FROM general.controlador
				WHERE activo=1
			`;

export const cameraSelectForConnection = `
				SELECT cmr_id, ip
				FROM %s.camara
				WHERE activo=1;
			`;

export const cameraSelectOneForConnection = `
				SELECT ip
				FROM %s.camara
				WHERE activo=1 and cmr_id=?;
			`;

export const cameraUpdate = `
				UPDATE %s.camara
				SET serie=?, tc_id=?, m_id=?, usuario=?, ip=?, puerto=?, descripcion=?, puertows=?, mascara=?, puertaenlace=?
				WHERE cmr_id=?;
			`;

export const cameraUpdatePwd = `
				UPDATE %s.camara
				SET serie=?, tc_id=?, m_id=?, usuario=?, ip=?, puerto=?, descripcion=?, puertows=?, mascara=?, puertaenlace=?, contraseña=?
				WHERE cmr_id=?;
			`;

export const cameraInsert = `
				INSERT INTO %s.camara (cmr_id, serie, tc_id, m_id, usuario, ip, puerto, descripcion, puertows, mascara, puertaenlace, contraseña, conectado, activo)
				VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1);
			`;

export const cameraDisable = `
				UPDATE %s.camara
				SET activo=0
				WHERE cmr_id=?;
			`;

export const cameraSetNet = `
				UPDATE %s.camara
				SET conectado=?
				WHERE cmr_id=?;
			`;

/**
 * Tuples to parse the camera data without password.
 */
export const cameraParse = [tupleInt, tupleTxt, tupleInt, tupleInt, tupleTxt, tupleTxt, tupleInt, tupleTxt, tupleInt, tupleTxt, tupleTxt];

/**
 * Tuples to parse the camera data with password.
 */
export const cameraParsePwd = addPasswordTuple(cameraParse);

export const cameraPasswordIndex = cameraParsePwd.length - 1;
export const cameraIDIndex = 0;
export const cameraIPIndex = 5;

/* Temperature sensors */

export const tempSensorsSelect = `
				SELECT st_id, serie, ubicacion
				FROM %s.sensortemperatura;
			`;

export const tempSensorUpdate = `
				UPDATE %s.sensortemperatura
				SET serie=?, ubicacion=?
				WHERE st_id=?;
			`;

export const tempSensorParse = [tupleInt, tupleTxt, tupleTxt];

/* Card reader */

export const cardReaderSelect = `
				SELECT lt_id, descripcion
				FROM %s.lectortarjeta;
			`;

export const cardReaderUpdate = `
				UPDATE %s.lectortarjeta
				SET descripcion =?
				WHERE lt_id =?;
			`;

export const cardReaderParse = [tupleInt, tupleTxt];

/**
 * Operations with the database that only require to select and send with no
 * further processing and no node dependent.
 */
export const tableTuples = [
  new TableTuple(Codes.VALUE_GROUP, Codes.VALUE_GROUPS_END, queries.regionSelect, 'region', false),
  new TableTuple(Codes.VALUE_SECTOR, Codes.VALUE_SECTOR_END, queries.sectorSelect, 'rubro', false),

  new TableTuple(Codes.VALUE_DETECTOR, Codes.VALUE_DETECTOR_END, queries.detectorSelect, 'equipoentrada', false),
  new TableTuple(Codes.VALUE_ACTUATOR, Codes.VALUE_ACTUATOR_END, queries.actuatorSelect, 'equiposalida', false),
  new TableTuple(Codes.VALUE_CAMERA_TYPE, Codes.VALUE_CAMERA_TYPE_END, queries.cameraTypeSelect, 'tipocamara', false),
  new TableTuple(Codes.VALUE_CAMERA_BRAND, Codes.VALUE_CAMERA_BRAND_END, queries.camBrandSelect, 'marca', false),
  new TableTuple(Codes.VALUE_RESOLUTION, Codes.VALUE_RESOLUTION_END, queries.selectResolutions, 'resolucion', false),
];

/**
 * nombre, celular, com
 */
export const generalParse = [tupleTxt, tupleInt, tupleTxt];

/* Firmwares */

export const firmwareInsert = `
	INSERT INTO general.firmware (archivo, mayor, menor, parche)
	VALUE (?,?,?,?);
`;

// export const firmwareSetAvailability = `
// 	UPDATE general.firmware
// 	SET disponible = ?
// 	WHERE f_id = ?;
// `;

export const firmwareOrderSelect = `
	SELECT * FROM general.firmware ORDER BY mayor DESC, menor DESC, parche DESC;
`;
