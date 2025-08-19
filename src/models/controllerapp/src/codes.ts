export const RECONNECT_DELAY = 10; // Delay to reconnect socket. Used by the server.
export const MAX_MSG_LENGTH = 511; // The maximum message length without the null character, i.e. the
// buffer must be MAX_MSG_LENGTH+1 long.

// Separators

export const SEP_EOL = '|'; // Separator of messages. Messages are composed of tokens. ASCII 124
export const SEP_CMD = '&'; // Separator of tokens. ASCII 38
export const SEP_MTY = '~'; // Identifier of empty content (to be filled by receiver). ASCII 126
export const SEP_LST = '_'; // Separator of items in a list. ASCII 95
export const SEP_EOL_2 = '|'; // Alternate separator
export const SEP_SIM = '^'; // Identifier of sim commands. ASCII 94

export const AIO_OK = 0x000; // Successfully executed
export const ERR = 0x001; // General error

export const ERR_NO_CMD = 0x002; // No command received
export const ERR_NO_ID = 0x003; // No id received
export const ERR_NO_PIN = 0x004; // Pin number is missing
export const ERR_NO_TIME = 0x005; // Wrong time received
export const ERR_NO_LINK = 0x006; // No link number found
export const ERR_NO_STATE = 0x007; // No state was found
export const ERR_NO_NUMBER = 0x008; // The string couldn't be converted to a number
export const ERR_NO_DELAY = 0x009; // No delay found
export const ERR_NO_MODE = 0x00a; // No mode found
export const ERR_NO_TEMP = 0x00b; // No temperature found
export const ERR_NO_CARD = 0x00c; // No card number found
export const ERR_INVALID_PIN = 0x00d; // Invalid pin
export const ERR_INVALID_LINK = 0x00e; // Invalid link
export const ERR_INVALID_TEMP = 0x00f; // Temperature out of limit.
export const ERR_SCAN_TEMP = 0x010; // error scanning temperature sensor
export const ERR_RANGE = 0x011; // Out of range
export const ERR_NOT_FOUND = 0x012; // export const VALUE not found
export const ERR_NO_SPACE = 0x013; // No available space left
export const ERR_MOUNTING_SD = 0x014; // Mounting SD card
export const ERR_UNMOUNTING_SD = 0x015; // Unmounting SD card
export const ERR_INIT_VSPI = 0x016; // Initializing SPI
export const ERR_OPENING_FILE = 0x017; // Opening file
export const ERR_WRITING_FILE = 0x018; // Writing to file
export const ERR_CLOSING_FILE = 0x019; // Closing file
export const ERR_INIT_NVS = 0x01a; // Initializing NVS
export const ERR_VNS_ERASED = 0x01b; // NVS was erased
export const ERR_ERASING_VNS = 0x01c; // Could not erase NVS
export const ERR_WRITING_NVS = 0x01d; // Writing to the NVS partition
export const ERR_READING_NVS = 0x01e; // Reading the NVS partition
export const ERR_NVS_NOT_INITIALIZED = 0x01f; // The NVS partition is not initialized
export const ERR_NO_USER = 0x020; // No user name found
export const ERR_NO_PASSWORD = 0x021; // No password found
export const ERR_WRONG_USRPWD = 0x022; // User/password combination doesn't exist
export const ERR_UNKNOWN_CMD = 0x023; // Unknown command received
export const ERR_ANOTHER_CONNECTED = 0x024; // Another user is already connected
export const ERR_UNKNOWN_VALUE = 0x025; // The value is unknown
export const ERR_NO_VALUE = 0x026; // No value received
export const ERR_NO_TITLE = 0x027;
export const ERR_NO_TXT = 0x028;
export const ERR_NO_INDEX = 0x029;
export const ERR_NO_IP = 0x02a;
export const ERR_NO_PORT = 0x02b;
export const ERR_NO_MASK = 0x02c;
export const ERR_NO_NEW_PASSWORD = 0x02d; // No new password received
export const ERR_NO_UINT = 0x02e; // No unsigned integer
export const ERR_EXECUTING_QUERY = 0x02f; // Executing query
export const ERR_DISCONNECTED = 0x030; // Disconnected
export const ERR_NO_ENABLES = 0x031; // No enables data
export const ERR_NO_UINT64 = 0x032; // No unsigned 64 bit integer
export const ERR_CTRL_NOT_RESPONDING = 0x033; // Controller is not responding
export const ERR_MEASURE_TEMP = 0x034; // Error issuing measure command
export const ERR_READ_TEMP = 0x035; // Error reading one sensor
export const ERR_NO_ADDRESS = 0x036; // No address found
export const ERR_NO_ALARM = 0x037; // No alarm found
export const ERR_NO_OFFSET = 0x038; // No offset found
export const ERR_NO_CHANGE = 0x039; // There was no change / The value is the same as the previous
export const ERR_NO_LOGGED_IN = 0x03a; // The user is not logged in
export const J_ERR_TIMEOUT = 0x03b; // Operation timeout
export const ERR_NO_ADMIN = 0x03c; // Missing admin info
export const ERR_NO_INT = 0x03d; // Missing integer
export const ERR_NO_BIG = 0x03e; // Missing BigIngeter. Used in Java
export const ERR_NO_CARD_READER_TYPE = 0x03f; // Missing card reader type
export const ERR_NO_LONG = 0x040; // Missing long.
export const ERR_NO_FLOAT = 0x041; // Missing float.
export const ERR_INCOMPATIBLE = 0x042; // Version is not compatible
export const ERR_NOT_NEEDED = 0x043; // An update for the send version is not needed
export const ERR_TOO_OLD = 0x044; // The firmware sent is too old for the server
export const ERR_CORRUPTED = 0x045; // The data sent is corrupted
export const ERR_NO_PHONE = 0x046; // No valid phone number found

export const VALUE_ONE_LINK = 0x200; // Set or get one output link
export const VALUE_ACTIVE_DELAY = 0x201; // Set or get delay to active
export const VALUE_INACTIVE_DELAY = 0x202; // Set or get delay to inactive
export const VALUE_AUTO_DELAY = 0x203; // Set or get the delay to return to auto mode
export const VALUE_ACTIVE_MODES = 0x204; // Set or get the active modes from all inputs
export const VALUE_ACTIVE_MODES_OUTPUT = 0x205; // Not implemented (redundancy by double negation).
export const VALUE_INPUT_STATES = 0x206; // Get the state of ALL inputs. Input states SHOULD NOT BE SET
// by command
export const VALUE_OUTPUT_STATES = 0x207; // Get the state of ALL outputs. Output states are set
// INDIVIDUALLY by command
// elsewhere
export const VALUE_TEMP_LIMIT = 0x208; // Set or get the temperature limit
export const VALUE_COLD_DELAY = 0x209; // Set or get the time to extend the 'hot' state of the
// temperature
export const VALUE_AUTH_DELAY = 0x20a; // Set or get the authorization delay
// export const VALUE_CARD_ADD = 0x20B // Add one card number to authorized list
// export const VALUE_CARD_REMOVE = 0x20C // Remove one card from authorized list
export const VALUE_ALL_CARDS = 0x20d; // Get all cards registered as authorized
export const VALUE_REBOOT = 0x20e; // Reboot ESP
export const VALUE_GROUP = 0x20f; // Add or get groups info.
export const VALUE_GROUPS_END = 0x210; // End the transmission of groups data
export const VALUE_NODE = 0x211; // Add or get nodes info
export const VALUE_NODES_END = 0x212; // End the transmission of nodes data
export const VALUE_SECTOR = 0x214; // Get the available sectors
export const VALUE_SECTOR_END = 0x215; // End sectors transmission
export const VALUE_USER = 0x216; // Add or get the users
export const VALUE_USER_END = 0x217; // Get the users
export const VALUE_ACTUATOR = 0x218; // Get the actuators
export const VALUE_ACTUATOR_END = 0x219; // Get the actuators end
export const VALUE_DETECTOR = 0x21a; // Get the detectors
export const VALUE_DETECTOR_END = 0x21b; // Get the detectors end
export const VALUE_ROLE = 0x21c; // Get the roles
export const VALUE_ROLE_END = 0x21d; // Get the roles end
export const VALUE_COMPANY = 0x21e; // Add or get the companies
export const VALUE_COMPANY_END = 0x21f; // Get the companies end
export const VALUE_WORKER = 0x220; // Add or get the workers
export const VALUE_WORKER_END = 0x221; // Get the workers end
export const VALUE_CARD = 0x222; // Update or get cards
export const VALUE_CARD_END = 0x223; // Get cards end
export const VALUE_GROUP_DISABLE = 0x224; // Remove or set an empty group
export const VALUE_NODE_DISABLE = 0x225; // Get or set an empty node
export const VALUE_COMPANY_DISABLE = 0x226; // Get or set an empty company
export const VALUE_USER_DISABLE = 0x227; // Get or set an empty user
export const VALUE_WORKER_DISABLE = 0x228; // Get or set an empty worker
export const VALUE_CARD_EMPTY = 0x229; // Get or set an empty card
// export const VALUE_SECTOR_EMPTY = 0x22A // Get or set an empty sector (not used)
// export const VALUE_ROLE_EMPTY = 0x22B // Get or set an empty role (not used)
// export const VALUE_ACTUATOR_EMPTY = 0x22C // Get or set an empty actuator (not used)
// export const VALUE_DETECTOR_EMPTY = 0x22D // Get or set an empty detector (not used)
export const VALUE_NODE_PASSWORD = 0x22e; // Set the node password
export const VALUE_WORKER_PHOTO = 0x22f; // Set the worker photo
export const VALUE_USER_PASSWORD = 0x230; // Set the user password
export const VALUE_INPUT = 0x231; // Get or set the input data
export const VALUE_OUTPUT = 0x232; // Get or set the output data
export const VALUE_CAMERA = 0x233; // Get or set the cameras data
export const VALUE_CAMERA_TYPE = 0x234; // Get the camera types
export const VALUE_TEMP_SENSOR = 0x235; // Get or set the temperature sensors data
export const VALUE_CAMERA_BRAND = 0x236; // Get the camera brands
// export const VALUE_INPUT_EMPTY = 0x237 // Get empty input
export const VALUE_INPUT_END = 0x238; // End of inputs
// export const VALUE_OUTPUT_EMPTY = 0x239 // Get empty output
export const VALUE_OUTPUT_END = 0x23a; // End of outputs
export const VALUE_CAMERA_DISABLE = 0x23b; // Disable or get empty camera
export const VALUE_CAMERA_END = 0x23c; // End of cameras
// export const VALUE_CAMERA_TYPE_EMPTY = 0x23D // Get empty camera type
export const VALUE_CAMERA_TYPE_END = 0x23e; // End of camera types
// export const VALUE_CAMERA_BRAND_EMPTY = 0x23F // Get empty camera brand
export const VALUE_CAMERA_BRAND_END = 0x240; // End of camera brands
// export const VALUE_TEMP_SENSOR_EMPTY = 0x241 // Get empty temperature sensor
export const VALUE_TEMP_SENSOR_END = 0x242; // End of temperature sensors
export const VALUE_INPUT_ENABLES = 0x243; // Set or get the enabled values for all inputs
export const VALUE_OUTPUT_ENABLES = 0x244; // Set or get the enabled values for all outputs
export const VALUE_INPUT_CTRL_END = 0x245; // End input data from the controller
export const VALUE_OUTPUT_CTRL_END = 0x246; // End output data from the controller
export const VALUE_INPUT_CTRL = 0x247; // Input data from the controller
export const VALUE_OUTPUT_CTRL = 0x248; // Output data from the controller
export const VALUE_ACTIVE_MODE_ONE = 0x249; // Get or set one active mode for one input
export const VALUE_INPUT_ENABLE_ONE = 0x24a; // Set or get one enable for one input
export const VALUE_OUTPUT_ENABLE_ONE = 0x24b; // Set or get one enable for one output
export const VALUE_POST = 0x24c; // Get the posts
export const VALUE_POST_END = 0x24d; // End of posts
// export const VALUE_POST_EMPTY = 0x24E // Empty post
export const VALUE_STRUCT_INPUT = 0x24f; // Get inputs structure
export const VALUE_STRUCT_TEMP = 0x250; // Structure of the temperature sensors
export const VALUE_STRUCT_CARD = 0x251; // Structure of the card readers
export const VALUE_STRUCT_NORMAL = 0x252; // Structure of the normal inputs
export const VALUE_ADDRESS = 0x253; // Get or set the address for one temperature sensor
export const VALUE_TEMP_SENSOR_CTRL = 0x254; // Temperature sensor data from controller
export const VALUE_TEMP_ENABLE_ONE = 0x255; // Set or get one temperature sensor enable
export const VALUE_TEMP_SENSOR_CTRL_END = 0x256; // End temperature sensor from controller
export const VALUE_ARM = 0x257; // Security is armed
export const VALUE_DISARM = 0x258; // Security is disarmed
export const VALUE_OUTPUT_ALARM_ONE = 0x259; // Get or set whether one output is an alarm or not
export const VALUE_VOLTAGE_ACTIVE = 0x25a; // Output voltage is active
export const VALUE_VOLTAGE_INACTIVE = 0x25b; // Output voltage is inactive
export const VALUE_CTRL_STATE = 0x25c; // Get the controller state
export const VALUE_SECURITY = 0x25d; // Get the security on demand or as an event
export const VALUE_SD = 0x25e; // Event of the sd card
export const VALUE_VOLTAGE = 0x25f; // Get or set the output voltage mode
export const VALUE_OFFSET = 0x260; // Get or set the temperature offset
export const VALUE_INPUT_STATE_ONE = 0x261; // Get the state of one input
export const VALUE_OUTPUT_STATE_ONE = 0x262; // Get the state of one output
export const VALUE_STATES = 0x263; // Get all the current states (inputs, outputs and temperatures)
export const VALUE_LAST_TEMP_ONE = 0x264; // Get the last temperature of one sensor
export const VALUE_NET = 0x265; // Get or set the net configuration
export const VALUE_TO_AUTO = 0x266; // Set the mode of one output to auto
export const VALUE_CONNECTED = 0x267; // Connected state
export const VALUE_DISCONNECTED = 0x268; // Disconnected state
export const VALUE_DENIED = 0x269; // Not logged in
export const VALUE_NET_PASSWORD = 0x26a; // Get or set the network data with a new password
// export const VALUE_CARD_UPDATE = 0x26B // Update one card data
export const VALUE_CARD_READER = 0x26c; // Card reader data from controller
// export const VALUE_CARD_READER_EMPTY = 0x26D // Empty card reader
export const VALUE_CARD_READER_CTRL_END = 0x26e; // End of card readers
export const VALUE_CARD_READER_ENABLE_ONE = 0x26f; // Get or set one card reader enable
export const VALUE_CARD_READER_CTRL = 0x270; // Card reader data from controller
export const VALUE_GROUP_ADD = 0x271; // Add a group
export const VALUE_NODE_ADD = 0x272;
export const VALUE_COMPANY_ADD = 0x273;
export const VALUE_USER_ADD = 0x274;
export const VALUE_WORKER_ADD = 0x275;
export const VALUE_CAMERA_ADD = 0x276;
export const VALUE_ACCESS_TYPE = 0x277;
export const VALUE_ACCESS_TYPE_END = 0x278;
export const VALUE_CAMERA_PASSWORD = 0x279;
export const VALUE_CARD_READER_END = 0x27a;
export const VALUE_CARD_READER_TYPE_ONE = 0x27b;
export const VALUE_CARD_READER_STATE_ONE = 0x27c;
export const VALUE_TEMP_READER_STATE_ONE = 0x27d;
export const VALUE_CAN_ACCEPT_TICKET = 0x27e;
export const VALUE_TEMP_ENABLES = 0x27f; // Get all the temperatures sensors enables
export const VALUE_ALL_ENABLES = 0x280; // Send all enables
export const VALUE_ENERGY = 0x281; // Send all energy modules data
export const VALUE_ENERGY_END = 0x282; // End energy modules data
export const VALUE_ENERGY_CTRL = 0x283; // Send all energy modules data from controller
export const VALUE_ENERGY_CTRL_END = 0x284; // End energy modules data from controller
export const VALUE_ENERGY_ENABLE_ONE = 0x285; // Set or get one enable for one energy module
export const VALUE_ENERGY_INSTALL = 0x286; // Install one energy module
export const VALUE_CARD_SYNC = 0x287; // Synchronize cards. Is the same as VALUE_CARD but this should not log
export const VALUE_CARD_EMPTY_SYNC = 0x288; // Synchronize cards. Is the same as VALUE_CARD_EMPTY but this should not log
export const VALUE_ENERGY_ENABLES = 0x289; // Get all energy modules enables
export const VALUE_ORDER_RESULT = 0x28a; // Send the result of an order
export const VALUE_RESOLUTION = 0x28b; // Resolution received
export const VALUE_RESOLUTION_END = 0x28c; // End resolutions
export const VALUE_MODE = 0x28d; // Controller mode
export const VALUE_MODE_SECURITY = 0x28e; // Mode security
export const VALUE_MODE_FREE = 0x28f; // Mode free
export const VALUE_GENERAL = 0x290; // General info
export const VALUE_SECURITY_WEB = 0x291; // Program the security from the web
export const VALUE_ARM_WEB = 0x292; // Security arm from web
export const VALUE_DISARM_WEB = 0x293; // Security disarm from web
export const VALUE_STRUCT_MODES = 0x294; // Structure of the mode and security
export const VALUE_ALL_ADDRESSES = 0x295; // Send all temperature sensor addresses
export const VALUE_ADDRESS_CHANGED = 0x296; // Temperature sensor address changed
export const VALUE_DELAY_TO_ARM = 0x297; // Set or get the delay to arm
export const VALUE_SECURITY_TECH = 0x298; // Program the security from the technician
export const VALUE_SECURITY_STATE = 0x299; // Send the security state (one of the 4 states)
export const VALUE_TICKET_DELAY_TO_ARM = 0x29a; // Set or get the delay to arm for tickets
export const VALUE_SECURITY_TICKET = 0x29b; // The security was programmed from a ticket
export const VALUE_MOUNTING = 0x29c; // The sd card in being mounted
export const VALUE_SD_TECH = 0x29d; // Set or get the SD state from the technician
export const VALUE_SD_STATE = 0x29e; // Get the complete sd state
export const VALUE_NODE_STATE = 0x29f; // Notify the controller state to the technicians
export const VALUE_SERIAL = 0x2a0; // Get the serial number
export const VALUE_NEED_UPDATE = 0x2a1; // Ask if an update for a specific version  is needed
export const VALUE_VERSION = 0x2a2; // Request versionç
export const VALUE_FIRMWARE_ADD = 0x2a3; // Send a new firmware
export const VALUE_ALARM_THRESHOLD = 0x2a4; // Set or get the alarm threshold
export const VALUE_ALARM_PERIOD = 0x2a5; // Set or get the alarm period
export const VALUE_PROTOCOL = 0x2a6; // Get the current protocol used to communicate.
export const VALUE_TCP = 0x2a7; // TCP Protocol
export const VALUE_GSM = 0x2a8; // GSM Protocol
export const VALUE_OUTPUT_ALARM_DELAY = 0x2a9; // Delay to turn off alarm
export const VALUE_ALARM_THRESHOLD_CHANGED = 0x2aa; // Alarm Threshold changed
export const VALUE_ALL_THRESHOLDS = 0x2ab; // Send all temperature sensors alarm thresholds
export const VALUE_ALL_ORDER_STATES = 0x2ac; // Send all order states to the server
export const VALUE_SERVER_PHONE = 0x2ad; // Set the server phone number
export const VALUE_COM = 0x2ae; // Get the COMs available
export const VALUE_COMS_END = 0x2af; // End COMs

export const VALUE_SOCKET_CLOSED = 0x400; // Socket was closed
export const VALUE_AUTHORIZED = 0x401; // Card authorized
export const VALUE_NOT_AUTHORIZED = 0x402; // Card not authorized
export const VALUE_TO_ACTIVE = 0x403; // Pin changed to active or set an output state to ACTIVE manually
export const VALUE_TO_INACTIVE = 0x404; // Pin changed to inactive or set an output to INACTIVE manually
export const VALUE_NO_AH = 0x405; // Normally open or active in high
export const VALUE_NC_AL = 0x406; // Normally closed or active in low
export const VALUE_MOUNT = 0x407; // Mount the SD card
export const VALUE_EJECT = 0x408; // Re-mount SD card
export const VALUE_UNPLUGGED = 0x409; // Device not plugged in
export const VALUE_TRUE = 0x40a;
export const VALUE_FALSE = 0x40b;
export const VALUE_OUTPUT_TYPE_ALARM = 0x40c; // Alarm type
export const VALUE_OUTPUT_TYPE_NO_ALARM = 0x40d; // Not alarm type
export const VALUE_OUTPUT_TYPE_FREE = 0x40e; // Free type
export const VALUE_ARMING = 0x40f; // Arming is programmed
export const VALUE_DISARMING = 0x410; // Disarming is programmed
export const VALUE_NONE = 0x411; // None value. General use.
export const VALUE_EJECTING = 0x412; // Unmounting sd card

/**
 * Command to set the initial configuration in the controller once the socket is
 * connected. This should be sent as a response to a login, or at any time to
 * the controller to set the current date.
 * Expected format:
 *
 * CMD_HELLO_FROM_SRVR,id,time
 */
export const CMD_HELLO_FROM_SRVR = 0x600;

/**
 * Command to greet from the manager. By design, nor the controller or the
 * server has to log in to the manager, so the manager doesn't have to sent this
 * command as a response. Like {@linkcode CMD_HELLO_FROM_SRVR}, this command should
 * be sent to the controller to set the current date.
 * Expected format:
 *
 * CMD_HELLO_FROM_MNGR,id,time
 */
export const CMD_HELLO_FROM_MNGR = 0x601;

/**
 * Command to inform the result of the execution of a command. This does not
 * retrieve any extra data.
 * Expected format:
 *
 * CMD_RESPONSE,message_id,response
 */
export const CMD_RESPONSE = 0x602;

/**
 *  Command to send a internal error to the server.
 *  Expected format:
 *
 *  CMD_ERROR,error_type,datetime_VALUE
 */
export const CMD_ERR = 0x603;

/**
 *  Command to send temperature data to the server.
 *  Expected format:
 *
 *  CMD_TEMP,datetime_VALUE,temperature_1,temperature_2,...
 */
export const CMD_TEMP = 0x604;

/**
 *  Command to send an event to the server when a card has been read.
 *  Expected format:
 *
 *  CMD_CARD_READ,card_number,authorized_or_not,datetime
 */
export const CMD_CARD_READ = 0x605;

/**
 *  Command to set configuration VALUEs related to the I/O.
 *  To set one link:
 *
 *  CMD_PIN_CONFIG_SET,message_id,output_num,VALUE_ONE_LINK,new_VALUE
 *
 *  To set one delay to active/inactive:
 *
 *  CMD_PIN_CONFIG_SET,message_id,pin_num,VALUE_(ACTIVE/INACTIVE)_DELAY,new_delay_in_seconds
 *
 *  To set one delay to auto:
 *
 *  CMD_PIN_CONFIG_SET,message_id,output_num,VALUE_AUTO_DELAY,new_delay_in_seconds
 *
 *  To set one output pin state by order:
 *
 *  CMD_ORDER,message_id,output_num,VALUE_TO_(ACTIVE/INACTIVE)
 */
export const CMD_PIN_CONFIG_SET = 0x606;

/**
 *  Command to get configuration VALUEs related to one input/output.
 *  Expected format when sending to the controller:
 *
 *  CMD_PIN_CONFIG_GET,message_id,pin_num,param_to_retrieve
 *
 *  Where `param_to_retrieve` can be:
 *
 *  VALUE_ONE_LINK
 *
 *  VALUE_ACTIVE_DELAY / VALUE_INACTIVE_DELAY
 *
 *  VALUE_AUTO_DELAY
 *
 *  When responding to the server:
 *
 *  VALUE_(requested),message_id,pin,params_export const VALUEs
 */
export const CMD_PIN_CONFIG_GET = 0x607;

/**
 *  Command to set general configuration VALUEs.
 *  To set all input active modes:
 *
 *  CMD_CONFIG_SET,message_id,VALUE_ACTIVE_MODES,new_modes
 *
 *  To set the temperature limit:
 *
 *  CMD_CONFIG_SET,message_id,VALUE_TEMP_LIMIT,new_limit_as_float
 *
 *  To set the delay to cold:
 *
 *  CMD_CONFIG_SET,message_id,VALUE_COLD_DELAY,new_delay_in_seconds
 *
 *  To set the delay to remove authorization
 *
 *  CMD_CONFIG_SET,message_id,VALUE_AUTH_DELAY,new_delay_in_seconds
 *
 *  To add one card number as authorized:
 *
 *  CMD_CONFIG_SET,message_id,VALUE_CARD_ADD,new_card
 *
 *  To remove one authorized card:
 *
 *  CMD_CONFIG_SET,message_id,VALUE_CARD_REMOVE,card_to_remove
 */
export const CMD_CONFIG_SET = 0x608;

/**
 *  Commands to get general configuration VALUEs.
 *  Expected format when sending to the controller:
 *
 *  CMD_CONFIG_GET,message_id,param_to_retrieve
 *
 *  Where `param_to_retrieve` can be:
 *
 *  VALUE_INPUT_STATES
 *
 *  VALUE_OUTPUT_STATES
 *
 *  VALUE_ACTIVE_MODES
 *
 *  VALUE_TEMP_LIMIT
 *
 *  VALUE_COLD_DELAY
 *
 *  VALUE_AUTH_DELAY
 *
 *  When responding to the server:
 *
 *  VALUE_(requested),message_id,params_VALUEs
 */
export const CMD_CONFIG_GET = 0x609;

/**
 *  Command to send an event to the server when an input has changed its state.
 *  Expected format:
 *
 *  CMD_INPUT_CHANGED,pin,new_state,datetime
 */
export const CMD_INPUT_CHANGED = 0x60a;

/**
 *  Command to send an event to the server when an output has changed its state.
 *  Expected format:
 *
 *  CMD_OUTPUT_CHANGED,pin,new_state,datetime
 */
export const CMD_OUTPUT_CHANGED = 0x60b;

/**
 *  Command to send a network event to the server.
 *  Expected format:
 *
 *  CMD_NET,event_type,datetime
 */
export const CMD_NET = 0x60c;

/**
 *  Command to send a SD card event to the server.
 *  Expected format:
 *
 *  CMD_SD_CARD,event_type,datetime
 */
export const CMD_SD_CARD = 0x60d;

/**
 *  Command to send other kind of orders to the controller
 *  Expected format:
 *
 *  CMD_ESP,user,password,order
 *
 *  Where order can be:
 *
 *  VALUE_REBOOT to reboot ESP
 */
export const CMD_ESP = 0x60e;

export const CMD_LOGOUT = 0x60f;

/**
 * Command to log in the server Expected format:
 *
 * CMD_LOGIN,msgID,user,password
 */
export const CMD_LOGIN = 0x610;

/**
 * Login to controller. The controller will logout automatically after one
 * message Expected format:
 *
 * CMD_LOGIN_NODE_ONE_USE,msgID,nodeID,password
 */
export const CMD_LOGIN_NODE_ONE_USE = 0x611;

/**
 * Test if the node is connected. Used before downloading node data to avoid
 * screens swapping when the node is not connected. Expected format:
 *
 * CMD_TEST_CONNECTED,msgID,nodeID
 */
export const CMD_TEST_CONNECTED = 0x612;

export const CMD_HELLO_FROM_CTRL = 0x613;

export const CMD_SERVER_ENDED = 0x614;

/**
 * This is used to signal that the controller is still connected. This
 * command should be send constantly ONLY IF THE OUTPUT STACK IS EMPTY.
 * Any message in the output stack that is sent should be a signal to the
 * server that the controller is still connected. There is no need to
 * send the time with this message.
 * Expected format:
 *
 * CMD_KEEP_ALIVE,msgID
 */
export const CMD_KEEP_ALIVE = 0x615;

/**
 * The controller confirmed a command
 */
export const CMD_CTRL_CONFIRM = 0x616;

/**
 * Used to start the process of adding one ticket. Subsequent messages
 * should send the card numbers for this ticket using VALUE_CARD_ADD.
 * Expected format:
 *
 * CMD_TICKET_ADD,msg_id,ticket_id,start_time,end_time
 */
export const CMD_TICKET_ADD = 0x617;

/**
 * Used to remove one ticket. Expected format:
 *
 * CMD_TICKET_REMOVE,msg_id,ticket_id
 */
export const CMD_TICKET_REMOVE = 0x618;

/**
 * Used to end the process of adding a new ticket. Temporal parameters
 * related to tickets should reset when this command is received.
 */
export const CMD_TICKET_END = 0x619;

/**
 * Used to send the power levels measured by the PZEM-004T
 */
export const CMD_POWER = 0x61a;

/**
 * Request a keepalive
 */
export const CMD_KEEP_ALIVE_REQUEST = 0x61b;

/**
 * A card reader changed authorization
 */
export const CMD_AUTHORIZATION_CHANGED = 0x61c;

/**
 * @brief To send an update. The version is appended as separate fields
 * Format sent by the server        CDM_UPDATE,id,major,minor,patch
 * Format sent by the controller    CDM_UPDATE,id,response[,token]
 */
export const CMD_UPDATE = 0x61d;

/**
 * @brief Continue with the download of the new firmware
 * Format CMD_UPDATE_CONTINUE,0,token,content
 */
export const CMD_UPDATE_CONTINUE = 0x61e;

/**
 * @brief End the download of the firmware
 * Format CMD_UPDATE_END,0,token
 */
export const CMD_UPDATE_END = 0x61f;

/**
 * @brief Send a temperature alarm.
 * Format: CMD_TEMP_ALARM,sensor_id,temp_value,time
 */
export const CMD_TEMP_ALARM = 0x620;

/**
 * @brief Send on temperature state change
 * Format: VALUE_TEMP_CHANGED, sensor_id, state
 */
export const CMD_TEMP_CHANGED = 0x621;

/**
 * @brief The server sent a SIM keep alive to the controller
 * Format: `CMD_SERVER_SIM_ALIVE,token;`
 */
export const CMD_SERVER_SIM_ALIVE = 0x622;
