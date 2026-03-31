import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { I18nContext, type Lang } from './i18n-context';

const STORAGE_KEY = 'sn_language';
const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label'] as const;
const textNodeOriginals = new WeakMap<Text, string>();
const attrOriginals = new WeakMap<Element, Partial<Record<(typeof TRANSLATABLE_ATTRIBUTES)[number], string>>>();
const translationCache = new Map<string, string>();

const frWordMap: Record<string, string> = {
  'home': 'accueil',
  'machine': 'machine',
  'machines': 'machines',
  'services': 'services',
  'service': 'service',
  'about': 'à propos',
  'contact': 'contact',
  'login': 'connexion',
  'log': 'connexion',
  'in': 'en',
  'out': 'déconnexion',
  'dashboard': 'tableau de bord',
  'rentals': 'locations',
  'rental': 'location',
  'user': 'utilisateur',
  'users': 'utilisateurs',
  'management': 'gestion',
  'staff': 'personnel',
  'drivers': 'chauffeurs',
  'finances': 'finances',
  'settings': 'paramètres',
  'notifications': 'notifications',
  'account': 'compte',
  'profile': 'profil',
  'personal': 'personnel',
  'information': 'informations',
  'name': 'nom',
  'email': 'email',
  'phone': 'téléphone',
  'number': 'numéro',
  'update': 'mettre à jour',
  'security': 'sécurité',
  'change': 'modifier',
  'password': 'mot de passe',
  'current': 'actuel',
  'new': 'nouveau',
  'confirm': 'confirmer',
  'save': 'enregistrer',
  'changes': 'modifications',
  'welcome': 'bienvenue',
  'create': 'créer',
  'register': 'inscrire',
  'search': 'rechercher',
  'no': 'aucun',
  'found': 'trouvé',
  'active': 'actif',
  'pending': 'en attente',
  'verified': 'vérifié',
  'status': 'statut',
  'available': 'disponible',
  'rented': 'loué',
  'maintenance': 'maintenance',
  'total': 'total',
  'cost': 'coût',
  'payment': 'paiement',
  'due': 'dû',
  'message': 'message',
  'send': 'envoyer',
  'office': 'bureau',
  'location': 'emplacement',
  'support': 'assistance',
  'company': 'entreprise',
  'address': 'adresse',
  'currency': 'devise',
  'date': 'date',
  'format': 'format',
  'assign': 'assigner',
  'task': 'tâche',
  'cancel': 'annuler',
  confirm_assignment: 'confirmer l\'affectation',
  'a': 'un',
  'access': 'accès',
  'accessible': 'accessible',
  'accounts': 'comptes',
  'across': 'à travers',
  'actions': 'actions',
  'activity': 'activité',
  'add': 'ajouter',
  'adjusting': 'ajustement',
  'admin': 'admin',
  'aerial': 'aérien',
  'alerts': 'alertes',
  'all': 'tout',
  'already': 'déjà',
  'amount': 'montant',
  'an': 'un',
  'and': 'et',
  'any': 'tout',
  'approvals': 'approbations',
  'approve': 'approuver',
  'approved': 'approuvé',
  'are': 'sont',
  'as': 'comme',
  'assignment': 'affectation',
  'at': 'à',
  'attroriginals': 'attroriginaux',
  'authentication': 'authentification',
  'auto': 'auto',
  'back': 'retour',
  'be': 'être',
  'believe': 'croire',
  'book': 'réserver',
  'booking': 'réservation',
  'bookings': 'réservations',
  'browse': 'naviguer',
  'budget': 'budget',
  'build': 'construire',
  'bulldozer': 'bulldozer',
  'bulldozers': 'bulldozers',
  'business': 'entreprise',
  'by': 'par',
  'can': 'pouvoir',
  'cancelled': 'annulé',
  'card': 'carte',
  'catalog': 'catalogue',
  'category': 'catégorie',
  'charged': 'facturé',
  'chars': 'caractères',
  'choose': 'choisir',
  'city': 'ville',
  'code': 'code',
  'compactor': 'compacteur',
  'complete': 'terminer',
  'completed': 'terminé',
  'condition': 'condition',
  'configuration': 'configuration',
  'confirmed': 'confirmé',
  'construction': 'construction',
  'contractors': 'entrepreneurs',
  'copy': 'copier',
  'costs': 'coûts',
  'country': 'pays',
  'coverage': 'couverture',
  'cranes': 'grues',
  'credentials': 'identifiants',
  'critical': 'critique',
  'currently': 'actuellement',
  'customer': 'client',
  'cvc': 'cvc',
  'd': 'j',
  'daily': 'quotidien',
  'day': 'jour',
  'days': 'jours',
  'delivery': 'livraison',
  'description': 'description',
  'details': 'détails',
  'developers': 'développeurs',
  'didn\'t': 'n\'a pas',
  'directly': 'directement',
  'dispatch': 'expédition',
  'display': 'afficher',
  'don\'t': 'ne pas',
  'driver': 'pilote',
  'duration': 'durée',
  'efficiency': 'efficacité',
  'employee': 'employé',
  'empower': 'habiliter',
  'empowering': 'responsabilisation',
  'encrypted': 'crypté',
  'end': 'fin',
  'ends': 'se termine',
  'engine': 'moteur',
  'enter': 'entrer',
  'equipment': 'équipement',
  'est': 'est',
  'established': 'établi',
  'estimate': 'estimer',
  'etc': 'etc',
  'example': 'exemple',
  'excavator': 'excavateur',
  'excavators': 'pelles',
  'excellent': 'excellent',
  'exchange': 'échange',
  'expense': 'dépense',
  'expenses': 'dépenses',
  'expert': 'expert',
  'expiry': 'expiration',
  'explore': 'explorer',
  'export': 'exporter',
  'factor': 'facteur',
  'fair': 'juste',
  'faster': 'plus rapide',
  'feedback': 'retour d\'information',
  'fetchnotifications': 'récupérer',
  'fill': 'remplir',
  'filters': 'filtres',
  'filterstatus': 'statut',
  'filtertype': 'type',
  'finance': 'finance',
  'first': 'premier',
  'fleet': 'flotte',
  'flexible': 'flexible',
  'for': 'pour',
  'forgot': 'oublié',
  'form': 'formulaire',
  'formdata': 'données',
  'fri': 'ven',
  'from': 'de',
  'frwordmap': 'frwordmap',
  'full': 'plein',
  'fully': 'pleinement',
  'future': 'avenir',
  'get': 'obtenir',
  'give': 'donner',
  'good': 'bon',
  'grown': 'grandi',
  'happening': 'se passe',
  'have': 'avoir',
  'health': 'santé',
  'hear': 'entendre',
  'heavy': 'lourd',
  'help': 'aide',
  'here': 'ici',
  'high': 'haut',
  'how': 'comment',
  'image': 'image',
  'imageurl': 'url',
  'includes': 'comprend',
  'income': 'revenu',
  'individual': 'individuel',
  'info': 'info',
  'instant': 'instantané',
  'insurance': 'assurance',
  'insured': 'assuré',
  'interval': 'intervalle',
  'into': 'dans',
  'invoice': 'facture',
  'jan': 'jan',
  'job': 'emploi',
  'join': 'rejoindre',
  'kept': 'gardé',
  'last': 'dernier',
  'license': 'licence',
  'lift': 'soulever',
  'links': 'liens',
  'live': 'en direct',
  'loader': 'chargeur',
  'love': 'amour',
  'lowercase': 'minuscule',
  'm': 'm',
  'machinery': 'machinerie',
  'manage': 'gérer',
  'map': 'carte',
  'mark': 'marque',
  'matching': 'correspondant',
  'maximum': 'maximum',
  'mechanic': 'mécanicien',
  'mechanics': 'mécaniciens',
  'member': 'membre',
  'method': 'méthode',
  'min': 'min',
  'minutes': 'minutes',
  'mission': 'mission',
  'modern': 'moderne',
  'mon': 'lun',
  'month': 'mois',
  'monthly': 'mensuel',
  'my': 'mon',
  'n': 'n',
  'navigate': 'naviguer',
  'need': 'besoin',
  'net': 'net',
  'next': 'suivant',
  'notes': 'notes',
  'notification': 'notification',
  'now': 'maintenant',
  'of': 'de',
  'off': 'désactivé',
  'offer': 'offrir',
  'on': 'sur',
  'one': 'un',
  'openstreetmap': 'openstreetmap',
  'operator': 'opérateur',
  'operators': 'opérateurs',
  'optional': 'optionnel',
  'options': 'options',
  'or': 'ou',
  'our': 'notre',
  'overview': 'aperçu',
  'paid': 'payé',
  'partner': 'partenaire',
  'pay': 'payer',
  'paymentmethod': 'paiement',
  'payments': 'paiements',
  'peak': 'pic',
  'per': 'par',
  'performance': 'performance',
  'plate': 'plaque',
  'platforms': 'plateformes',
  'possible': 'possible',
  'powerful': 'puissant',
  'preferences': 'préférences',
  'premium': 'premium',
  'price': 'prix',
  'pricing': 'tarification',
  'processing': 'traitement',
  'profit': 'profit',
  'profits': 'profits',
  'project': 'projet',
  'projects': 'projets',
  'promise': 'promesse',
  'provide': 'fournir',
  'quality': 'qualité',
  'question': 'question',
  'quick': 'rapide',
  'range': 'gamme',
  'rarr': 'rarr',
  'rate': 'taux',
  'rated': 'évalué',
  'rates': 'taux',
  'reach': 'atteindre',
  'ready': 'prêt',
  'receive': 'recevoir',
  'recent': 'récent',
  'recommended': 'recommandé',
  'record': 'enregistrement',
  'records': 'dossiers',
  'refresh': 'rafraîchir',
  'region': 'région',
  'regularly': 'régulièrement',
  'reject': 'rejeter',
  'rejected': 'rejeté',
  'reliability': 'fiabilité',
  'reliable': 'fiable',
  'rent': 'louer',
  'request': 'demande',
  'require': 'exiger',
  'requires': 'nécessite',
  'resend': 'renvoyer',
  'reserved': 'réservé',
  'reset': 'réinitialiser',
  'respond': 'répondre',
  'retrieve': 'récupérer',
  'return': 'retour',
  'returned': 'retourné',
  'returns': 'retours',
  'retype': 'retaper',
  'reviews': 'avis',
  'rights': 'droits',
  'role': 'rôle',
  'safety': 'sécurité',
  'satisfaction': 'satisfaction',
  'searchterm': 'terme',
  'seconds': 'secondes',
  'secure': 'sécurisé',
  'select': 'sélectionner',
  'selectedstaff': 'personnel',
  'sent': 'envoyé',
  'serial': 'série',
  'serviced': 'entretenu',
  'session': 'session',
  'sign': 'signer',
  'site': 'site',
  'skilled': 'qualifié',
  'solutions': 'solutions',
  'soon': 'bientôt',
  'special': 'spécial',
  'star': 'étoile',
  'start': 'commencer',
  'strength': 'force',
  'summary': 'résumé',
  'symbol': 'symbole',
  'system': 'système',
  'tailored': 'sur mesure',
  'tasks': 'tâches',
  'team': 'équipe',
  'that': 'que',
  'the': 'le',
  'this': 'ce',
  'tier': 'niveau',
  'time': 'temps',
  'timeline': 'chronologie',
  'timeout': 'timeout',
  'title': 'titre',
  'to': 'à',
  'today': 'aujourd\'hui',
  'tolowercase': 'minuscule',
  'top': 'haut',
  'touch': 'toucher',
  'track': 'suivre',
  'tracking': 'suivi',
  'transaction': 'transaction',
  'truck': 'camion',
  'trusted': 'fiable',
  'try': 'essayer',
  'two': 'deux',
  'type': 'type',
  'types': 'types',
  'u': 'u',
  'until': 'jusqu\'à',
  'uppercase': 'majuscule',
  'us': 'nous',
  'values': 'valeurs',
  'verify': 'vérifier',
  'view': 'voir',
  'vision': 'vision',
  'vs': 'contre',
  'want': 'vouloir',
  'we': 'nous',
  'we\'d': 'nous aurions',
  'we\'ll': 'nous allons',
  'weekend': 'week-end',
  'weekly': 'hebdomadaire',
  'what\'s': 'qu\'est-ce que',
  'why': 'pourquoi',
  'with': 'avec',
  'won\'t': 'ne sera pas',
  'work': 'travail',
  'york': 'york',
  'you': 'vous',
  'your': 'votre',
};

const rwWordMap: Record<string, string> = {
  'home': 'ahabanza',
  'machine': 'imashini',
  'machines': 'imashini',
  'services': 'serivisi',
  'service': 'serivisi',
  'about': 'ibijyanye',
  'contact': 'twandikire',
  'login': 'injira',
  'log': 'injira',
  'in': 'muri',
  'out': 'sohoka',
  'dashboard': 'urupapuro',
  'rentals': 'ubukode',
  'rental': 'ubukode',
  'user': 'umukoresha',
  'users': 'abakoresha',
  'management': 'imicungire',
  'staff': 'abakozi',
  'drivers': 'abashoferi',
  'finances': 'imari',
  'settings': 'igenamiterere',
  'notifications': 'amatangazo',
  'account': 'konti',
  'profile': 'umwirondoro',
  'personal': 'bwite',
  'information': 'amakuru',
  'name': 'izina',
  'email': 'Email',
  'phone': 'telefone',
  'number': 'nimero',
  'update': 'vugurura',
  'security': 'umutekano',
  'change': 'hindura',
  'password': 'ijambobanga',
  'current': 'ya none',
  'new': 'gishya',
  'confirm': 'emeza',
  'save': 'bika',
  'changes': 'ibyahinduwe',
  'welcome': 'ikaze',
  'create': 'kora',
  'register': 'iyandikishe',
  'search': 'shaka',
  'no': 'nta',
  'found': 'byabonetse',
  'active': 'bikora',
  'pending': 'bitegereje',
  'verified': 'byemejwe',
  'status': 'imiterere',
  'available': 'biboneka',
  'rented': 'byakodeshejwe',
  'maintenance': 'isanwa',
  'total': 'igiteranyo',
  'cost': 'igiciro',
  'payment': 'kwishyura',
  'due': 'biteganyijwe',
  'message': 'ubutumwa',
  'send': 'ohereza',
  'office': 'ibiro',
  'location': 'aho biherereye',
  'support': 'ubufasha',
  'company': 'isosiyete',
  'address': 'aderesi',
  'currency': 'ifaranga',
  'date': 'itariki',
  'format': 'imiterere',
  'assign': 'shyiraho',
  'task': 'akazi',
  'cancel': 'hagarika',
  'a': 'umwe',
  'access': 'kwinjira',
  'accessible': 'bigerwaho',
  'accounts': 'konti',
  'across': 'hake',
  'actions': 'ibikorwa',
  'activity': 'igikorwa',
  'add': 'ongera',
  'adjusting': 'guhindura',
  'admin': 'admin',
  'aerial': 'kiguruka',
  'alerts': 'imbuzi',
  'all': 'byose',
  'already': 'kera',
  'amount': 'umubare',
  'an': 'umwe',
  'and': 'na',
  'any': 'byose',
  'approvals': 'ibyemezo',
  'approve': 'emeza',
  'approved': 'yemejwe',
  'are': 'ni',
  'as': 'nka',
  'assignment': 'inshingano',
  'at': 'kuri',
  'attroriginals': 'attroriginals',
  'authentication': 'kwemeza',
  'auto': 'auto',
  'back': 'inyuma',
  'be': 'ba',
  'believe': 'izere',
  'book': 'fata',
  'booking': 'gufata',
  'bookings': 'ibyafashwe',
  'browse': 'shakisha',
  'budget': 'ingengo',
  'build': 'yubake',
  'bulldozer': 'bulldozer',
  'bulldozers': 'bulldozers',
  'business': 'ubucuruzi',
  'by': 'na',
  'can': 'shobora',
  'cancelled': 'bihagaritswe',
  'card': 'ikarita',
  'catalog': 'urutonde',
  'category': 'icyiciro',
  'charged': 'yishyuwe',
  'chars': 'inyuguti',
  'choose': 'hitamo',
  'city': 'umujyi',
  'code': 'code',
  'compactor': 'compactor',
  'complete': 'kuzuza',
  'completed': 'byuzuye',
  'condition': 'imiterere',
  'configuration': 'igenamiterere',
  'confirmed': 'byemejwe',
  'construction': 'ubwubatsi',
  'contractors': 'abubatsi',
  'copy': 'gukoporora',
  'costs': 'ibiciro',
  'country': 'igihugu',
  'coverage': 'kureba',
  'cranes': 'cranes',
  'credentials': 'ibiranga',
  'critical': 'ingenzi',
  'currently': 'ubu',
  'customer': 'umukiriya',
  'cvc': 'cvc',
  'd': 'd',
  'daily': 'burimunsi',
  'day': 'umunsi',
  'days': 'iminsi',
  'delivery': 'kugemurira',
  'description': 'ibisobanuro',
  'details': 'ibirambuye',
  'developers': 'abategura',
  'didn\'t': 'ntibyagenze',
  'directly': 'ako',
  'dispatch': 'kohereza',
  'display': 'ereka',
  'don\'t': 'ntukore',
  'driver': 'umushoferi',
  'duration': 'igihe',
  'efficiency': 'imikorere',
  'employee': 'umukozi',
  'empower': 'gushyigikira',
  'empowering': 'kongerera',
  'encrypted': 'bifunguye',
  'end': 'irangira',
  'ends': 'birangira',
  'engine': 'moteri',
  'enter': 'injiza',
  'equipment': 'ibikoresho',
  'est': 'est',
  'established': 'gushyiraho',
  'estimate': 'ikigereranyo',
  'etc': 'n\'ibindi',
  'example': 'urugero',
  'excavator': 'excavator',
  'excavators': 'excavators',
  'excellent': 'byiza',
  'exchange': 'kuvunja',
  'expense': 'igiciro',
  'expenses': 'ibiciro',
  'expert': 'impuguke',
  'expiry': 'kurangira',
  'explore': 'shakisha',
  'export': 'kohereza',
  'factor': 'impamvu',
  'fair': 'bikwiye',
  'faster': 'vuba',
  'feedback': 'ibitekerezo',
  'fetchnotifications': 'zizanwa',
  'fill': 'uzuza',
  'filters': 'ibiyunguruzo',
  'filterstatus': 'imiterere',
  'filtertype': 'ubwoko',
  'finance': 'imari',
  'first': 'imbere',
  'fleet': 'imodoka',
  'flexible': 'byoroshye',
  'for': 'kuri',
  'forgot': 'wibagiwe',
  'form': 'ifishi',
  'formdata': 'amakuru',
  'fri': 'gatanu',
  'from': 'kuva',
  'frwordmap': 'frwordmap',
  'full': 'yuzuye',
  'fully': 'byuzuye',
  'future': 'hazaza',
  'get': 'bona',
  'give': 'tanga',
  'good': 'byiza',
  'grown': 'byakuze',
  'happening': 'kuba',
  'have': 'fite',
  'health': 'ubuzima',
  'hear': 'umva',
  'heavy': 'iremereye',
  'help': 'ubufasha',
  'here': 'aha',
  'high': 'hejuru',
  'how': 'gute',
  'image': 'ishusho',
  'imageurl': 'url',
  'includes': 'harimo',
  'income': 'injiza',
  'individual': 'umuntu',
  'info': 'amakuru',
  'instant': 'ako',
  'insurance': 'ubwishingizi',
  'insured': 'yishingiwe',
  'interval': 'igihe',
  'into': 'muri',
  'invoice': 'fagitire',
  'jan': 'mutarama',
  'job': 'akazi',
  'join': 'injira',
  'kept': 'bibitswe',
  'last': 'iheruka',
  'license': 'uruhushya',
  'lift': 'kuzamura',
  'links': 'amahuza',
  'live': 'imbonankubone',
  'loader': 'loader',
  'love': 'urukundo',
  'lowercase': 'ntoya',
  'm': 'm',
  'machinery': 'imashini',
  'manage': 'cunga',
  'map': 'ikarita',
  'mark': 'ikimenyetso',
  'matching': 'bihuye',
  'maximum': 'ntarengwa',
  'mechanic': 'umukanishi',
  'mechanics': 'abakanishi',
  'member': 'umunyamuryango',
  'method': 'uburyo',
  'min': 'min',
  'minutes': 'iminota',
  'mission': 'intego',
  'modern': 'igezweho',
  'mon': 'mbere',
  'month': 'ukwezi',
  'monthly': 'burikwezi',
  'my': 'yanjye',
  'n': 'n',
  'navigate': 'shakisha',
  'need': 'keneye',
  'net': 'net',
  'next': 'bikurikira',
  'notes': 'inyandiko',
  'notification': 'itangazo',
  'now': 'ubu',
  'of': 'cya',
  'off': 'kura',
  'offer': 'tanga',
  'on': 'kuri',
  'one': 'imwe',
  'openstreetmap': 'openstreetmap',
  'operator': 'umukozi',
  'operators': 'abakozi',
  'optional': 'amahitamo',
  'options': 'amahitamo',
  'or': 'cyangwa',
  'our': 'yacu',
  'overview': 'incamake',
  'paid': 'yishyuwe',
  'partner': 'umufatanyabikorwa',
  'pay': 'ishyura',
  'paymentmethod': 'kwishyura',
  'payments': 'kwishyura',
  'peak': 'hejuru',
  'per': 'kuri',
  'performance': 'imikorere',
  'plate': 'icyapa',
  'platforms': 'imbuga',
  'possible': 'bikorwa',
  'powerful': 'imbaraga',
  'preferences': 'amahitamo',
  'premium': 'premium',
  'price': 'igiciro',
  'pricing': 'ibiciro',
  'processing': 'guteganya',
  'profit': 'inyungu',
  'profits': 'inyungu',
  'project': 'umushinga',
  'projects': 'imishinga',
  'promise': 'isezerano',
  'provide': 'tanga',
  'quality': 'ubwiza',
  'question': 'ikibazo',
  'quick': 'vuba',
  'range': 'urutonde',
  'rarr': 'rarr',
  'rate': 'igipimo',
  'rated': 'byahawe',
  'rates': 'ibipimo',
  'reach': 'gera',
  'ready': 'witeguye',
  'receive': 'akira',
  'recent': 'vuba',
  'recommended': 'byifuzwa',
  'record': 'inyandiko',
  'records': 'inyandiko',
  'refresh': 'vugurura',
  'region': 'akarere',
  'regularly': 'kamenyero',
  'reject': 'anga',
  'rejected': 'byanzwe',
  'reliability': 'kwizerwa',
  'reliable': 'yizewe',
  'rent': 'kodesha',
  'request': 'ubusabe',
  'require': 'saba',
  'requires': 'bisaba',
  'resend': 'ohereza',
  'reserved': 'byabitswe',
  'reset': 'subiramo',
  'respond': 'subiza',
  'retrieve': 'garura',
  'return': 'subiza',
  'returned': 'byagarutse',
  'returns': 'imusaruro',
  'retype': 'ongera',
  'reviews': 'ibitekerezo',
  'rights': 'uburenganzira',
  'role': 'uruhare',
  'safety': 'umutekano',
  'satisfaction': 'kugaranirwa',
  'searchterm': 'ijambo',
  'seconds': 'amasegonda',
  'secure': 'bifite',
  'select': 'hitamo',
  'selectedstaff': 'abakozi',
  'sent': 'byoherejwe',
  'serial': 'nimero',
  'serviced': 'byakozwe',
  'session': 'ikiringo',
  'sign': 'sinya',
  'site': 'urubuga',
  'skilled': 'abahanga',
  'solutions': 'ibisubizo',
  'soon': 'vuba',
  'special': 'cyihariye',
  'star': 'inyenyeri',
  'start': 'tangira',
  'strength': 'imbaraga',
  'summary': 'incamake',
  'symbol': 'ikimenyetso',
  'system': 'sisitemu',
  'tailored': 'yihariye',
  'tasks': 'imirimo',
  'team': 'ikipe',
  'that': 'icyo',
  'the': 'iyo',
  'this': 'iyi',
  'tier': 'icyiciro',
  'time': 'igihe',
  'timeline': 'igihe',
  'timeout': 'igihe',
  'title': 'umutwe',
  'to': 'kuri',
  'today': 'uyu',
  'tolowercase': 'ntoya',
  'top': 'hejuru',
  'touch': 'kora',
  'track': 'kurikirana',
  'tracking': 'gukurikirana',
  'transaction': 'kugura',
  'truck': 'ikamyo',
  'trusted': 'yizewe',
  'try': 'gerageza',
  'two': 'kabiri',
  'type': 'ubwoko',
  'types': 'amoko',
  'u': 'u',
  'until': 'kugeza',
  'uppercase': 'nkuru',
  'us': 'twe',
  'values': 'agaciro',
  'verify': 'emeza',
  'view': 'reba',
  'vision': 'erekezo',
  'vs': 'vs',
  'want': 'shaka',
  'we': 'twebwe',
  'we\'d': 'twe',
  'we\'ll': 'twe',
  'weekend': 'wikendi',
  'weekly': 'icyumweru',
  'what\'s': 'iki',
  'why': 'kuki',
  'with': 'na',
  'won\'t': 'ntabwo',
  'work': 'akazi',
  'york': 'york',
  'you': 'wowe',
  'your': 'yawe',
};

const hasLetters = (text: string) => /[A-Za-z]/.test(text);
const isLikelyUrlOrEmail = (text: string) => /(https?:\/\/|www\.|@)/i.test(text);

const preserveWordCase = (original: string, translated: string) => {
  if (original.toUpperCase() === original) return translated.toUpperCase();
  if (original[0] === original[0]?.toUpperCase()) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  return translated;
};

const translateByWord = (text: string, lang: Lang) => {
  const map = lang === 'fr' ? frWordMap : rwWordMap;
  return text.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, (word) => {
    const key = word.toLowerCase();
    const translated = map[key];
    if (!translated) return word;
    return preserveWordCase(word, translated);
  });
};

const translatePhrase = (text: string, lang: Lang, phraseMap: Record<string, string>) => {
  if (lang === 'en') return text;
  const normalized = text.trim();
  if (!normalized || !hasLetters(normalized) || isLikelyUrlOrEmail(normalized)) return text;
  const cacheKey = `${lang}::${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const translated = phraseMap[normalized] || translateByWord(text, lang);
  translationCache.set(cacheKey, translated);
  return translated;
};

const translations: Record<Lang, Record<string, string>> = {
  en: {
    selectLanguage: 'Select language',
    english: 'English',
    french: 'French',
    kinyarwanda: 'Kinyarwanda',
    home: 'Home',
    machines: 'Machines',
    services: 'Our Services',
    about: 'About',
    contact: 'Contact',
    login: 'Log In',
    getStarted: 'Get Started',
    logout: 'Log Out',
    dashboard: 'Dashboard',
    rentals: 'Rentals',
    userManagement: 'User Management',
    staffDrivers: 'Staff & Drivers',
    finances: 'Finances',
    settings: 'Settings',
    notifications: 'Notifications',
    myAccount: 'My Account',
    signOut: 'Sign Out',
    profileSettings: 'Profile Settings',
    personalInfo: 'Personal Information',
    name: 'Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
    updateProfile: 'Update Profile',
    security: 'Security',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    saveChanges: 'Save Changes',
    passwordUpdated: 'Password updated successfully',
    profileUpdated: 'Profile updated successfully',
    passwordsDoNotMatch: 'Passwords do not match',
  },
  rw: {
    selectLanguage: 'Hitamo ururimi',
    english: 'Icyongereza',
    french: 'Igifaransa',
    kinyarwanda: 'Ikinyarwanda',
    home: 'Urusha',
    machines: 'Imashini',
    services: 'Serivisi zacu',
    about: 'Ibyerekeye',
    contact: 'Hamagara',
    login: 'Injira',
    getStarted: 'Tangira',
    logout: 'Sohoka',
    dashboard: 'Urupapuro rwibanze',
    rentals: 'Gukodesha',
    userManagement: 'Abakoresha',
    staffDrivers: 'Abakozi & Abashoferi',
    finances: 'Imari',
    settings: 'Igenamiterere',
    notifications: 'Amakuru',
    myAccount: 'Konti Yanjye',
    signOut: 'Sohoka',
    profileSettings: 'Igenamiterere rya Konti',
    personalInfo: 'Amakuru bwite',
    name: 'Izina',
    email: 'Imeri',
    phoneNumber: 'Nimero ya terefone',
    updateProfile: 'Vugurura Konti',
    security: 'Umutekano',
    changePassword: 'Hindura ijambo ryibanga',
    currentPassword: 'Ijambo ryibanga rya none',
    newPassword: 'Ijambo ryibanga rishya',
    confirmPassword: 'Kwemeza ijambo ryibanga',
    saveChanges: 'Bika ibyahinduwe',
    passwordUpdated: 'Ijambo ryibanga ryahinduwe neza',
    profileUpdated: 'Konti yavuguruwe neza',
    passwordsDoNotMatch: 'Amagambo yibanga ntabwo ahuye',
  },
  fr: {
    selectLanguage: 'Choisir la langue',
    english: 'Anglais',
    french: 'Français',
    kinyarwanda: 'Kinyarwanda',
    home: 'Accueil',
    machines: 'Machines',
    services: 'Nos Services',
    about: 'À propos',
    contact: 'Contact',
    login: 'Se connecter',
    getStarted: 'Commencer',
    logout: 'Se déconnecter',
    dashboard: 'Tableau de bord',
    rentals: 'Locations',
    userManagement: 'Gestion des utilisateurs',
    staffDrivers: 'Personnel & Chauffeurs',
    finances: 'Finances',
    settings: 'Paramètres',
    notifications: 'Notifications',
    myAccount: 'Mon compte',
    signOut: 'Se déconnecter',
    profileSettings: 'Paramètres du profil',
    personalInfo: 'Informations personnelles',
    name: 'Nom',
    email: 'Email',
    phoneNumber: 'Numéro de téléphone',
    updateProfile: 'Mettre à jour le profil',
    security: 'Sécurité',
    changePassword: 'Modifier le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    saveChanges: 'Enregistrer les modifications',
    passwordUpdated: 'Mot de passe mis à jour avec succès',
    profileUpdated: 'Profil mis à jour avec succès',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'rw' || saved === 'fr') return saved;
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = useCallback((key: string) => {
    const phraseMap = translations[lang] || {};
    const enMap = translations.en || {};
    if (phraseMap[key]) return phraseMap[key];
    if (enMap[key]) return enMap[key];
    return translatePhrase(key, lang, phraseMap);
  }, [lang]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.lang = lang;
    let isApplying = false;
    let rafId: number | null = null;
    const pendingRoots = new Set<Node>();

    const shouldSkipElement = (el: Element | null) => {
      if (!el) return true;
      const tagName = el.tagName;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG'].includes(tagName)) return true;
      return Boolean(el.closest('[data-no-translate="true"]'));
    };

    const applyTextNode = (node: Text) => {
      if (shouldSkipElement(node.parentElement)) return;

      const current = node.nodeValue ?? '';
      if (!textNodeOriginals.has(node)) {
        textNodeOriginals.set(node, current);
      }

      const original = textNodeOriginals.get(node) ?? current;
      if (!original.trim()) return;

      node.nodeValue = lang === 'en'
        ? original
        : translatePhrase(original, lang, translations[lang] || {});
    };

    const applyElementAttributes = (el: Element) => {
      if (shouldSkipElement(el)) return;

      const saved = attrOriginals.get(el) ?? {};

      for (const attr of TRANSLATABLE_ATTRIBUTES) {
        const current = el.getAttribute(attr);
        if (!current) continue;

        if (!saved[attr]) {
          saved[attr] = current;
        }

        const original = saved[attr] ?? current;
        const translated = lang === 'en'
          ? original
          : translatePhrase(original, lang, translations[lang] || {});
        el.setAttribute(attr, translated);
      }

      attrOriginals.set(el, saved);
    };

    const applySubtree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        applyTextNode(root as Text);
        return;
      }

      if (!(root instanceof Element) && !(root instanceof DocumentFragment)) return;

      const baseElement = root instanceof Element ? root : null;
      if (baseElement) {
        applyElementAttributes(baseElement);
      }

      const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let textNode = textWalker.nextNode();
      while (textNode) {
        applyTextNode(textNode as Text);
        textNode = textWalker.nextNode();
      }

      if (baseElement || root instanceof DocumentFragment) {
        const selector = TRANSLATABLE_ATTRIBUTES.map((attr) => `[${attr}]`).join(', ');
        const attrScope = root instanceof Element || root instanceof DocumentFragment
          ? root
          : document.body;
        attrScope.querySelectorAll(selector).forEach((el) => applyElementAttributes(el));
      }
    };

    const applyFullDocument = () => {
      if (!document.body) return;
      isApplying = true;
      applySubtree(document.body);
      isApplying = false;
    };

    applyFullDocument();

    const translateDialogMessage = (message: unknown) => {
      const normalized = typeof message === 'string' ? message : String(message ?? '');
      return lang === 'en'
        ? normalized
        : translatePhrase(normalized, lang, translations[lang] || {});
    };

    const originalAlert = window.alert.bind(window);
    const originalConfirm = window.confirm.bind(window);
    const originalPrompt = window.prompt.bind(window);

    window.alert = ((message?: unknown) => {
      originalAlert(translateDialogMessage(message));
    }) as Window['alert'];

    window.confirm = ((message?: string) => {
      return originalConfirm(translateDialogMessage(message));
    }) as Window['confirm'];

    window.prompt = ((message?: string, defaultValue?: string) => {
      return originalPrompt(translateDialogMessage(message), defaultValue);
    }) as Window['prompt'];

    const flushPending = () => {
      if (isApplying) return;

      isApplying = true;
      pendingRoots.forEach((root) => applySubtree(root));
      pendingRoots.clear();
      isApplying = false;
      rafId = null;
    };

    const scheduleApply = (root: Node) => {
      pendingRoots.add(root);
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(flushPending);
    };

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'childList') {
          record.addedNodes.forEach((node) => scheduleApply(node));
          continue;
        }

        if (record.type === 'characterData') {
          scheduleApply(record.target);
          continue;
        }

        if (record.type === 'attributes') {
          scheduleApply(record.target);
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });

    return () => {
      observer.disconnect();
      window.alert = originalAlert;
      window.confirm = originalConfirm;
      window.prompt = originalPrompt;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      pendingRoots.clear();
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
