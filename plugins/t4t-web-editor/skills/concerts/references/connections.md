# Conexiones verificadas

- Web de producción: https://talesforthetillerman.website/
- Repositorio: https://github.com/amehcgracia-byte/t4tweb-1
- Vercel: proyecto `prj_LXyh0dDdK7gJT6bH0g9U9mFxOWzz`, equipo `team_0tER4zIWIG6JwQSZntVwDPao`.
- Sanity: proyecto `qtpb6qpz`, dataset `production`, tipo `concert`, workspace de conciertos `t4t-concerts` (esquema local en `sanity/concert-sync`). Conserva `t4t-studio` para el editor visual existente.
- Bandsintown: artista `15638928`; panel https://artists.bandsintown.com/artists/15638928/events/upcoming
- Songkick: artista `10418553`; cuenta gestora `Tales4theTillerman`; panel https://tourbox.songkick.com/artists/10418553/calendar
- Spotify artista oficial: `0FHjK3O0k8HQMrJsF7KQwF`.
- Bandcamp oficial: https://talesforthetillerman.bandcamp.com/
- Drive está disponible a través del conector. Busca materiales por venue y fecha; no extraigas secretos de Accounts ni los copies al código.

## ART Stalker — prueba real

- 13/11/2026, 19:30, Europe/Berlin, 15 EUR.
- Kaiser-Friedrich-Str. 67, 10627 Berlin, Germany.
- Sanity ID: `46c354d1-300c-41ad-8138-72b19dd6b897`; editorId existente: `16`.
- Bandsintown evento: `109096773`, https://www.bandsintown.com/e/109096773
- Facebook evento oficial: https://www.facebook.com/events/1144183394632015/
- Flyer original: https://www.facebook.com/photo/?fbid=10215891639800110&set=gm.1144183474632007
- Venue Bandsintown `10017894`: ART Stalker - Kunst + Bar + Events, Berlin. Es un alias confirmado de ART Stalker.
- Songkick evento publicado: `43491265`, https://www.songkick.com/concerts/43491265-tales-for-the-tillerman-at-art-stalker ; performance `81450496`. Cartel original publicado y visualmente verificado: poster `39589109`. No duplicar ni volver a subir.

## APIs consultadas el 29/10/2026

Bandsintown documenta lectura de artistas y eventos, no se ha establecido escritura para esta cuenta: https://help.artists.bandsintown.com/en/articles/9186477-api-documentation

Songkick documenta consultas mediante API y acceso sujeto a licencia; no se ha establecido escritura para esta cuenta: https://www.songkick.com/developer/

Usa los paneles autenticados para escritura. No conviertas las sesiones del navegador de ChatGPT en credenciales de un servicio externo sin autorización y un mecanismo de autenticación soportado.

## Cola privada

Ejecuta `python3 scripts/queue-client.py` desde esta skill. Lee la clave del llavero de macOS (`T4T WEB EDITOR production queue`) o del secreto de entorno `T4T_SYNC_SECRET`; nunca la imprimas. Sin entrada lista estados; un objeto JSON por stdin ejecuta una operación de la cola. El destino está fijado a la web oficial y no sigue redirecciones. Para marcar un trabajo verificado, usa una observación nueva del navegador, no copies la ficha deseada ni actualices la fecha de una observación antigua. No hay ejecutor recurrente activo.
