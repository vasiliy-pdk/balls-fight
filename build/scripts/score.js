pc.script.create('score', function (app) {
    // Creates a new Score instance
    var Score = function (entity) {
        this.entity = entity;
        this.player = {
            ball1: 0,
            ball2: 0
        };
        
        this.goalScore = 10;
        this.fallScore = 3;
        this.dropScore = 20;
        this.dropTimeThreshold = 5000;
        
        this.contacts = {};
    };

    Score.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.bindGameListeners();
            this.bindPlayerListeners();
            this.scoreEl = this.initScorePanel();
            this.renderScore();
        },

        bindGameListeners: function() {
            app.on('goal', this.onGoal, this);
            app.on('fall', this.onFall, this);
        },
        
        bindPlayerListeners: function() {
            var onCollisionStart = function(pEntity, result) { 
                return this.onPlayerCollisionStart(pEntity, result); 
            };
            
            for (var pName in this.player) {
                var pEntity = app.root.findByName(pName);
                pEntity.collision.on('collisionstart', _.partial(onCollisionStart, pEntity), this);
            }
        },
        
        onPlayerCollisionStart: function(target, result) {
            var tName = target.getName(),
                oName = result.other.getName();
            
            // Handle only if users are collading 
            if (!(_.has(this.player, tName) && _.has(this.player, oName))) return true;
            
            console.log('Collision beetwean balls accured: ', tName, oName);
            
            // Store the last contact
            this.contacts[tName] = {
                "with": oName,
                lastTs: _.now()
            };
        },
        
        onGoal: function (entity) {            
            this.player[entity.getName()] += this.goalScore;
            this.renderScore();
        },
        
        onFall: function (entity) {
            var name = entity.getName();
            entity.audiosource.play('fall');
            this.player[name] -= this.fallScore;
            if (this.player[name] < 0 )
                this.player[name] = 0;
            
            // Add score to other if he has dropped the fallen
            var lastContact = this.contacts[name];
            if ( lastContact && _.now() - lastContact.lastTs <= this.dropTimeThreshold ) {
                this.player[lastContact['with']] += this.dropScore;
            }
            
            // Flush all contacts containing the fallen one
            _.mapObject(this.contacts, function(contact) {
                contact['with'] = null;
                contact.lastTs = 0;
            });
            
            this.renderScore();
        },
        
        initScorePanel: function() {
            var insertBeforeEl =  document.getElementById(this.insertBeforeElId);
            var el = document.createElement('div');
            document.body.insertBefore(el, insertBeforeEl);
            el.style.position = "fixed";
            el.style.top = "20px";
            el.style.left = "20px";
            el.style.width = "100px";
            el.style.height = "50px";
            el.style.zIndex = 1000;
            
            document.body.insertBefore(el, insertBeforeEl);
            return el;
        },
        
        renderScore: function() {
            var scores = [];
            for ( var playerScore in this.player )
                scores.push(this.player[playerScore]);
            
            this.scoreEl.innerHTML = "<h1>" + scores.join(' : ') + "</h1>";
        },
        
        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        }
    };

    return Score;
});