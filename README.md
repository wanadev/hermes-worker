todo: Traduire en Anglais
# Worker Hermes

```
----------    Question     ----------  
|        | ------------->  |        |   
|  Page  |                 | Worker |   
|        | <------------   |        |   
----------     Reponse     ----------   
```


### Description :

Worker Hermes est une librairie que a pour but de simplifier l'uttilisation des WebWorker !   
Elle mets en place un systeme que question/reponse !

### Fonctionement Géneral 

Le worker peut etre vu comme une api, a qui l'ont demanderait de faire des calcul lourd, et qui nous repondrait le resultat !   
Le principe c'est que la page web actuel crée un noveau worker, en lui passent le code qu'on veut executer.

Hermes worker fonctione de la façon suivant :

 1. Déclaration du comptenu du worker grace a la fonction passer en parametre
 2. Initialisation des serializers, pour que les donnez qui transite entre le worker et la page soit toujours correct
 3. Instansiasion du worker
 4. Le worker definit les question au quelle il peut repondre
 5. Le worker été près a fonctionnée
 6. Plutard on a demande a Hermes transmetre la question X au worker 
 7. La question X est transmise au Worker
 8. Le worker fait les calcul nesesaire pour y repondre
 9. Le worker donne la reponse a Hermes
 10. Hermes vous donne la reponse

#### Utilisattion simple :
```
    function WorkerFunction() {
        // This code is excuted in worker
        const hermes = new HermesMessenger();
        hermes.onload().then(() => {
            function add(a,b) {
                return a + b;
            }
            hermes.addMethod("add", add);
            hermes.ready();
        });
    }

    const hermes = new hermes.HermesWorker(WorkerFunction, {});
    hermes.onload().then(() => {
        hermes.call('add', [1, 2]).then(result => {
            console.log(result); // result === 3
        });
    });
```

#### Approfondire :

<======= Scripts =======>

Hermes permet de charger des scripts dans votre worker pour simplifier le developement, par exemple un librerie !

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

Hermes permet également d'uttiliser vos propre serializer (Les serializer sont appellez dans l'ordre du tableau)

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
    hermes.onload().then(() => {
        hermes.call('add', ["1", "2"]).then(result => {
            console.log(result); // result === "3"
        });
    });
```

<======= Instance =======>

Hermes peut crée plusieur instance d'un meme worker pour que les calcul ce repartise sur different core logique du processeur !

ps: Si vous avez charger des scripts via hermes, ceci ne seront pas recharger pour chaque thread ! ;D

```
    function WorkerFunction() {
        // This code is excuted in worker
        const hermes = new HermesMessenger();

        hermes.onload().then(() => {
            console.log(hermes.config.threadInstance)
        });
    }
    const hermes = new hermes.HermesWorker(WorkerFunction, {
        threadInstances: 3
    });

    console output:

    worker 1 => 0
    worker 2 => 1
    worker 3 => 2
```

### Schema fonctionement

```
        Your Script                               Hermes                                    Web Worker
------------------------------         ------------------------------             -------------------------------
|  h=new HermesWorker(fn, {  |         |   Recuperre la fonction    |             |    function add(a,b) {      |
|       scripts,             |         |   Télécharge les scripts   |             |        return a + b;        |
|       serializers          |  ===>   |   Ajoutes les serializers  |      ===>   |    }                        |
|  });                       |         |   Crée le scrpit du worker |             |                             |
|                            |         |   Initialise le worker     |             |                             |
|                            |         |                            |             |                             |
|                            |         |    Le worker est pret      |    <===     |                             |
|  h.onload().then(() => {   |  <===   |    Il definie la fn add    |             |                             |
|                            |         |                            |             |                             |
|    h.call('add', [1,2])    |  ===>   |    Serialize les args      |             |                             |
|     .then(                 |         |    Envoie les donnée       |             |                             |
|                            |         |    Unserialize les donnée  |  ===>       |    add(1,2)                 |
|                            |         |                            |             |     a+b                     |
|                            |         |    Serialize la reponse    |    <===     |      3                      |
|                            |         |    Envoie les donnée       |             |                             |
|        (r) => r === 3      |  <===   |    Unserialize la reponse  |             |                             |
|     )                      |         |                            |             |                             |
|  });                       |         |                            |             |                             |
------------------------------         ------------------------------             -------------------------------
```
