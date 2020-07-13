todo: Traduire en Anglais
# Worker Hermes

```
----------    Question     ----------  
|        | ------------->  |        |   
|  Page  |                 | Worker |   
|        | <------------   |        |   
----------     Réponse     ----------   
```


### Description :

Worker Hermes est une librairie qui a pour but de simplifier l'utilisation des WebWorkers !   
Elle met en place un système de questions/réponses !

### Fonctionement Géneral 

Le worker peut être vu comme une api, à qui l'on demanderait de faire des calculs lourds, et qui nous répondrait avec le résultat !   
Le principe c'est que la page web actuelle crée un nouveau worker, en lui passant le code que l'on veut exécuter.

Hermes worker fonctione de la façon suivante :

 1. Déclaration du contenu du worker grâce à la fonction passée en paramètre
 2. Initialisation des serializers, pour que les données qui transitent entre le worker et la page soient toujours correctes
 3. Instanciation du worker
 4. Le worker définit les questions auxquelles il peut répondre
 5. Le worker est prêt à fonctionner
 6. Plus tard, on a demande à Hermes de transmettre la question X au worker
 7. La question X est transmise au Worker
 8. Le worker fait les calculs nécessaires pour y repondre
 9. Le worker donne la réponse à Hermes
 10. Hermes vous donne la réponse

#### Utilisation simple :
```
    function WorkerFunction() {
        // This code is excuted in worker
        function add(a,b) {
            return a + b;
        }
        hermes.on("add", add);
        hermes.ready();
    }

    const hermes = new hermes.HermesWorker(WorkerFunction, {});
    hermes.call('add', [1, 2]).then(result => {
        console.log(result); // result === 3
    });
```

#### Approfondir :

<======= Scripts =======>

Hermes permet de charger des scripts dans votre worker pour simplifier le dévelopement, par exemple une librairie !

Exemple :
```
    function WorkerFunction() {
        // This code is excuted in worker
        const hermes = new HermesMessenger();
        /** HERE BABYLON IS DEFINED **/
    }
    const hermes = new hermes.HermesWorker(WorkerFunction, {
        scripts: [
            "https://cdn.babylonjs.com/babylon.js"
        ]
    });
```

<======= Serializer =======>

Hermes permet également d'utiliser vos propres serializer (Les serializers sont appelés dans l'ordre du tableau)

Exemple: 

```
    const hermes = new hermes.HermesWorker(WorkerFunction, {
        serializers: [
            {
                serialize: function(args) {
                    return args.map(arg => parseInt(arg, 10));
                },
                unserialize: function(args) {
                    return args.map(arg => arg.toString());
                }
            }
        ]
    });
    hermes.call('add', ["1", "2"]).then(result => {
        console.log(result); // result === "3"
    });
```

<======= Instance =======>

Hermes peut créer plusieurs instances d'un même worker pour que les calculs ce répartissent sur differents cores logiques du processeur !

Il est possible de passer la valeur 'auto' qui instansira le nombre maximum de thread suivant chaque processeur

ps: Si vous avez chargé des scripts via hermes, ceux-ci ne seront pas rechargés pour chaque thread ! ;D

```
    function WorkerFunction() {
        // This code is excuted in worker
        console.log(hermes.config.threadInstance)
    }
    const hermes = new hermes.HermesWorker(WorkerFunction, {
        threadInstances: 3
    });

    console output:

    worker 1 => 0
    worker 2 => 1
    worker 3 => 2
```

<======= Via Url =======>

Avec Hermes vous pouvez aussi crée un worker depuis l'url d'un fichier par exemple

```
    // Dans le fichier script.js (executer coter navigateur)
    const worker = new hermes.HermesWorker("http://localhost/example/workerFile.js");

    // Dans le fichier workerFile.js
    console.log("Worker instance " + hermes.config.threadInstance + " is started");
```

### Schéma fonctionement

```
        Your Script                               Hermes                                    Web Worker
------------------------------         ------------------------------             -------------------------------
|  h=new HermesWorker(fn, {  |         |   Recupère la fonction     |             |    function add(a,b) {      |
|       scripts,             |         |   Télécharge les scripts   |             |        return a + b;        |
|       serializers          |  ===>   |   Ajoute les serializers   |      ===>   |    }                        |
|  });                       |         |   Crée le script du worker |             |                             |
|                            |         |   Initialise le worker     |             |                             |
|                            |         |                            |             |                             |
|                            |         |    Le worker est prêt      |    <===     |                             |
|  h.waitLoad().then(() => { |  <===   |    Il definit la fn add    |             |                             |
|                            |         |                            |             |                             |
|    h.call('add', [1,2])    |  ===>   |    Serialize les args      |             |                             |
|     .then(                 |         |    Envoie les données      |             |                             |
|                            |         |    Unserialize les données |  ===>       |    add(1,2)                 |
|                            |         |                            |             |     a+b                     |
|                            |         |    Serialize la réponse    |    <===     |      3                      |
|                            |         |    Envoie les données      |             |                             |
|        (r) => r === 3      |  <===   |    Unserialize la réponse  |             |                             |
|     )                      |         |                            |             |                             |
|  });                       |         |                            |             |                             |
------------------------------         ------------------------------             -------------------------------
```
