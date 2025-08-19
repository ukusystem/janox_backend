# uku.backend

Backend del proyecto Uku

# Changelog (controller side)

## 0.4.1

- Feat: Controller connection was not being notified to the web app

## 0.4.2

- Fix: Could not save new vms preference due to not considering some grid options.

## 0.4.3

- Fix: Error when creating a user and then editing it before saving to the database. The 'date' value was being passed as '~' as it is the default value for a new user.

---

# BRAINSTORM

# New version with sim

- Controller able to switch between ethernet or sim.
- UART driver is installed, but it's not used if module not responding. Messages are received and discarded. When configured to work with sim, messages are processed.
- Default configuration to work with ethernet. Initial configuration done with technician trough ethernet. Can be set to work with sim, if so, ethernet stops to work and closes session.
- Delete messages, the memory could overflow (DEL ALL only for SIMCOM).

# GSM from controller

- El controlador inicia ambos metodos: ethernet y GPRS
- Una sesion inicia con un login correcto.
- Ethernet tiene prioridad. Si hay una sesion por ethernet o se inicia una sesion, este metodo se usará siempre hasta que el socket se cierre.
- El metodo GPRS se usara solo cuando no haya una sesion por ethernet.

- Hay una tarea que solo ejecuta 'txrx_loop'
- 'txrx_loop' al inicio obtiene con que metodo toca leer y escribir esa iteracion. Tiene que ser durante toda esa iteracion para responder
  por el mismo metodo.
- Si hay sesion ethernet, siempre se escoge ethernet. Si hay sesion GPRS, se alterna el metodo entre GPRS y ethernet. Es decir, siempre
  se trata de leer datos de ethernet regularmente (siempre que haya un socket valido conectado).
- Establecer un socket valido hace que ethernet se escoga por lo menos alternadamente con GPRS, y cuando se establece la sesion por ethernet,
  se escoge ethernet siempre, por su prioridad.
- Para que ethernet sea elegible los requisitos son que haya un socket valido.
- El controlador necesita saber que el servidor puede recibir mensajes GSM para que estos eventos no se pierdan.
- El controlador tiene un flag 'sincronizado_por_gsm' que es falso cada reinicio y se pone true cuando ya se ha sincronizado con algun backend por gsm

## GSM Configuration

- Controller is configured with its own number. It can be null.
- Server number is a general property and must be updated to every connected controller. It can be null.
- The COM port used for the module is configured manually in technician. It can be null.
- When controller number is null, keep alive is never sent to that controller to save sms. Set the controller number only when it is going to be used.
- When server number is null or COM is null, all GSM funtions are disabled.
- When server number is not null and COM is not null, keep alives can be sent.
- Need to reconfigure SIM after card is connected to a network, can be detected with +COPS: 0,0,"TIM PERU"
- Controller need to configure a "net_name" (TIM PERU) to wait for it and configure it

## GSM Authentication

- ⨯ Server logs in and a token is sent back.
  - Expiration?
  - Mechanism to generate another token?
  - Should not send token as plain text?
  - Body should be encrypted? Then better to encrypt whole message, less messages
- ⨯ One order comes with validation and generates one response only and 'validation' ends.
  - Doesn't work, since some orders can generate a lot of responses.
- ⨯ Make a call.
  - Call won't last for long
- ✓ Encrypt whole message
  - Use RSA commutative, for signing and encrypting message
  - Heavier for controller
  - Server sends keep alive signal to controller so, controller knows when the module is installed in the server and the messages wont be lost.
  - After a keep alive from the server, messages can be sent for a period of time and after that time, messages won't be sent until the next keep alive.
- Its easy for someone impersonate the server number
- The controller needs the server's public key in order to only accept connections from that server.
- There must be a public and private key pair BEFORE installing controllers with GSM. The key files can be generated prior running the server but they should not change before installing the controllers and running the server.

## GSM From server

- Update procedure Ethernet
  - Every time a controller is logged in successfully, read phone from db and send it.
- Update procedure GSM
  - Server sends gsm keep alive to controller.
  - Controller knows there is a server gsm.
  -
- Update server phone in controllers
  - Server adds a message and register a response callback, which stops task which sent the sema message periodically.

## When to use ethernet or GSM from server

## Procedure of syncing

- The controller has a initial server number configured (in future versions the ).
- Server is constantly emiting SERVER_SIM_ALIVE to find out controllers only when its not logged in by ethernet and has a phone registered (send public keye as well).
- Controller received SERVER_SIM_ALIVE through GSM and then sync as usual (send public key and server phone as well). At this point the controller is " GSM synced"
- 'GSM synced' is not saved in NVS, so is false every reset.
- Once GSM synced, it will n

## SIM Unsolicited codes

- +CPIN: NOT READY when sim unplugged
- +COPS: 0,0,"TIM PERU" when sim connected to a network

## Backend configure GSM

- When por is open, call configure method
- Method sets configured to false
