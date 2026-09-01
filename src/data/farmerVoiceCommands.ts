import type { Intent } from '../types/voice';

export interface IntentDefinition {
  intent: Intent;
  route: string;
  enKeywords: string[];
  mrKeywords: string[];
  enPhrases: string[];
  mrPhrases: string[];
}

export const farmerIntents: IntentDefinition[] = [
  {
    intent: 'DASHBOARD',
    route: '/farmer/dashboard',
    enKeywords: ['dashboard', 'home', 'main page'],
    mrKeywords: ['डॅशबोर्ड', 'मुख्य पृष्ठ', 'होम'],
    enPhrases: [
      'open dashboard',
      'show dashboard',
      'go to dashboard',
      'take me to dashboard'
    ],
    mrPhrases: [
      'डॅशबोर्ड उघडा',
      'मला डॅशबोर्ड दाखवा',
      'मुख्य पृष्ठ उघडा'
    ]
  },
  {
    intent: 'MY_LOTS',
    route: '/farmer/lots',
    enKeywords: ['lots', 'lot', 'crops', 'produce', 'farm'],
    mrKeywords: ['लॉट', 'माल', 'पिके', 'शेतमाल'],
    enPhrases: [
      'show my lots',
      'open my lots',
      'show my crops',
      'show my produce',
      'show my farm lots'
    ],
    mrPhrases: [
      'माझे लॉट दाखवा',
      'माझा माल दाखवा',
      'माझी पिके दाखवा',
      'माझा शेतमाल दाखवा'
    ]
  },
  {
    intent: 'MARKET_INTELLIGENCE',
    route: '/farmer/market',
    enKeywords: ['market', 'mandi', 'price', 'prices', 'intelligence', 'rate'],
    mrKeywords: ['बाजार', 'भाव', 'बाजारभाव', 'मंडी', 'मंडीचे भाव', 'किंमत'],
    enPhrases: [
      'show market prices',
      'show mandi prices',
      'show market intelligence',
      'show today\'s prices',
      'check market price',
      'show crop prices'
    ],
    mrPhrases: [
      'मला बाजार भाव दाखवा',
      'आजचे बाजार भाव दाखवा',
      'मंडीचे भाव दाखवा',
      'बाजाराची माहिती दाखवा',
      'माझ्या पिकाचा भाव दाखवा',
      'मला बाजार भाव पाहायचा आहे'
    ]
  },
  {
    intent: 'MY_DECISIONS',
    route: '/farmer/decisions',
    enKeywords: ['decision', 'decisions', 'recommendation', 'recommendations', 'what should i do'],
    mrKeywords: ['निर्णय', 'शिफारस', 'काय करावे'],
    enPhrases: [
      'show my decisions',
      'show recommendations',
      'what should i do with my crop',
      'show selling recommendation',
      'show my crop recommendation'
    ],
    mrPhrases: [
      'माझे निर्णय दाखवा',
      'माझ्या पिकासाठी काय करावे',
      'मला काय निर्णय घ्यावा',
      'माझी शिफारस दाखवा'
    ]
  },
  {
    intent: 'OFFERS',
    route: '/farmer/offers',
    enKeywords: ['offer', 'offers', 'buyer offers'],
    mrKeywords: ['ऑफर', 'ऑफर्स', 'खरेदीदारांच्या ऑफर्स'],
    enPhrases: [
      'show my offers',
      'show buyer offers',
      'show offers',
      'show offers from buyers',
      'open offers',
      'मला माझ्या ऑफर्स पाहायच्या आहेत'
    ],
    mrPhrases: [
      'माझ्या ऑफर्स दाखवा',
      'खरेदीदारांच्या ऑफर्स दाखवा',
      'मला ऑफर्स दाखवा'
    ]
  },
  {
    intent: 'TRANSACTIONS',
    route: '/farmer/transactions',
    enKeywords: ['transaction', 'transactions', 'payment', 'payments', 'history'],
    mrKeywords: ['व्यवहार', 'पेमेंट', 'पैशांची माहिती'],
    enPhrases: [
      'show my transactions',
      'show transactions',
      'show payments',
      'show payment history',
      'show transaction history'
    ],
    mrPhrases: [
      'माझे व्यवहार दाखवा',
      'व्यवहाराची माहिती दाखवा',
      'माझे पेमेंट दाखवा',
      'माझ्या व्यवहारांची माहिती दाखवा',
      'माझे व्यवहार उघडा'
    ]
  },
  {
    intent: 'ISSUES_GRIEVANCES',
    route: '/farmer/issues',
    enKeywords: ['issue', 'issues', 'problem', 'grievance', 'grievances', 'complaint', 'complaints', 'report'],
    mrKeywords: ['तक्रार', 'समस्या', 'अडचण', 'तक्रारी'],
    enPhrases: [
      'report an issue',
      'report a problem',
      'show my grievances',
      'show complaints',
      'open issues',
      'i have a problem',
      'report a complaint'
    ],
    mrPhrases: [
      'तक्रार नोंदवा',
      'माझ्या तक्रारी दाखवा',
      'समस्या नोंदवा',
      'मला समस्या आहे',
      'माझी समस्या आहे',
      'माझ्या व्यवहारात समस्या आहे',
      'मला पेमेंटची तक्रार करायची आहे'
    ]
  },
  {
    intent: 'PROFILE',
    route: '/farmer/profile',
    enKeywords: ['profile', 'account', 'edit my profile'],
    mrKeywords: ['प्रोफाइल', 'माहिती'],
    enPhrases: [
      'open my profile',
      'show my profile',
      'edit my profile',
      'show my account'
    ],
    mrPhrases: [
      'माझे प्रोफाइल दाखवा',
      'प्रोफाइल उघडा',
      'माझी माहिती दाखवा'
    ]
  }
];
