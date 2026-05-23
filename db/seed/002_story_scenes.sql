-- ============================================================
-- STORY SCENES SEED: 5 Physics + 5 Biology
-- Bangladesh context, bilingual (Bangla + English)
-- ============================================================

-- ============================================================
-- PHYSICS: কাজ, ক্ষমতা ও শক্তি (Work, Power and Energy)
-- ============================================================

-- Scene 1: গ্রামে বিদ্যুৎ-হীন দিন (A Day Without Electricity)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 1,
  'গ্রামে বিদ্যুৎ-হীন দিন',
  'A Day Without Electricity',
  'বর্ষাকালে প্রচণ্ড ঝড়ে সিরাজগঞ্জের একটি গ্রামের বিদ্যুৎ লাইন ছিঁড়ে গেছে। রাতে পুরো গ্রাম অন্ধকারে ডুবে গেছে। ১৪ বছরের রাফি ভাবছে — বিদ্যুৎ ছাড়া কিভাবে আলো জ্বালানো যায়? সে তার বিজ্ঞান বইয়ের "কাজ, ক্ষমতা ও শক্তি" অধ্যায়টি খুলে বসলো। রাফির যাত্রা শুরু হলো — শক্তিকে বোঝার যাত্রা।',
  'A terrible monsoon storm has snapped the power lines in a village in Sirajganj. The entire village is plunged into darkness at night. 14-year-old Rafi wonders — how can we light up without electricity? He opens his science textbook to the chapter on "Work, Power and Energy." Rafi''s journey begins — a journey to understand energy.',
  NULL,
  'ঝড়ে বিদ্যুৎ লাইন ছিঁড়ে যাওয়ার পর রাফি কোন বিষয়ে সমাধান খুঁজছে?',
  'After the storm cuts the power lines, what is Rafi trying to find a solution for?',
  'কিভাবে শক্তি ব্যবহার করে আলো জ্বালানো যায়',
  'How to use energy to produce light',
  'কিভাবে ঝড় থামানো যায়',
  'How to stop the storm',
  'কিভাবে বিদ্যুৎ লাইন মেরামত করা যায়',
  'How to repair the power lines',
  'a',
  'রাফি শক্তির রূপান্তর বোঝার চেষ্টা করছে — কিভাবে এক ধরনের শক্তিকে আলোক শক্তিতে রূপান্তর করা যায়।',
  'Rafi is trying to understand energy transformation — how to convert one form of energy into light energy.',
  'zap'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'physics_ssc' AND ch.chapter_number = 4;

-- Scene 2: কুয়া থেকে পানি তোলা (Drawing Water from the Well — Work)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 2,
  'কুয়া থেকে পানি তোলা',
  'Drawing Water from the Well',
  'পরদিন সকালে রাফি তার দাদির সাথে পুরনো কুয়া থেকে পানি তুলতে গেলো। দড়ি টেনে ভারী বালতি ওপরে তুলতে গিয়ে রাফির হাত ব্যথা হয়ে গেলো। দাদি বললেন, "বাবা, তুমি কাজ করছো — বল দিয়ে বালতিকে ওপরে সরাচ্ছো।" রাফি বুঝলো: কাজ = বল × সরণ। বল প্রয়োগ করে বস্তুর সরণ ঘটালেই কাজ হয়।',
  'The next morning, Rafi goes with his grandmother to draw water from the old well. Pulling the heavy bucket up with the rope makes his hands ache. Grandma says, "Child, you are doing work — you are applying force to displace the bucket upward." Rafi understands: Work = Force × Displacement. Work happens when a force causes an object to move.',
  (SELECT c.id FROM concepts c JOIN chapters ch2 ON c.chapter_id = ch2.id JOIN subjects s2 ON ch2.subject_id = s2.id WHERE s2.code = 'physics_ssc' AND ch2.chapter_number = 4 AND c.name_en = 'Work'),
  'রাফি ১০ কেজি পানিভর্তি বালতি ১৫ মিটার গভীর কুয়া থেকে টেনে তুললো। এখানে "কাজ" হয়েছে কারণ —',
  'Rafi pulls a 10 kg bucket of water from a 15-meter deep well. "Work" is done here because —',
  'বল প্রয়োগের ফলে বালতির সরণ হয়েছে',
  'Force applied caused displacement of the bucket',
  'রাফি ক্লান্ত হয়ে গেছে',
  'Rafi got tired',
  'বালতিটি ভারী ছিলো',
  'The bucket was heavy',
  'a',
  'পদার্থবিজ্ঞানে কাজ তখনই হয় যখন বল প্রয়োগের ফলে বস্তুর সরণ ঘটে। ক্লান্ত হওয়া বা ভারী হওয়া কাজের সংজ্ঞা নয়।',
  'In physics, work is done only when a force causes displacement of an object. Feeling tired or the object being heavy does not define work.',
  'droplets'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'physics_ssc' AND ch.chapter_number = 4;

-- Scene 3: জল-চাকা ডিজাইন (Water Wheel Design — Power)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 3,
  'জল-চাকা ডিজাইন',
  'Designing a Water Wheel',
  'রাফি একটি ধারণা পেলো! গ্রামের পাশ দিয়ে বয়ে যাওয়া খালের স্রোত ব্যবহার করে জল-চাকা বানানো যায়। কিন্তু প্রশ্ন হলো — ছোট চাকা দ্রুত ঘোরে আর বড় চাকা ধীরে ঘোরে। কোনটা বেশি ক্ষমতাসম্পন্ন? রাফির বাবা বললেন, "ক্ষমতা মানে হলো কত দ্রুত কাজ করা যায়। একক সময়ে বেশি কাজ মানে বেশি ক্ষমতা।"',
  'Rafi has an idea! He can build a water wheel using the stream flowing beside the village. But the question is — the small wheel spins fast and the big wheel spins slowly. Which one has more power? Rafi''s father explains, "Power means how fast work is done. More work per unit time means more power."',
  (SELECT c.id FROM concepts c JOIN chapters ch2 ON c.chapter_id = ch2.id JOIN subjects s2 ON ch2.subject_id = s2.id WHERE s2.code = 'physics_ssc' AND ch2.chapter_number = 4 AND c.name_en = 'Power'),
  'দুটি জল-চাকা সমান পরিমাণ পানি তোলে। চাকা-ক উল্লেখযোগ্যভাবে দ্রুত কাজটি শেষ করে এবং চাকা-খ ধীরে করে। কোনটির ক্ষমতা বেশি?',
  'Two water wheels lift the same amount of water. Wheel-A finishes the job much faster and Wheel-B does it slowly. Which has more power?',
  'চাকা-ক, কারণ সে কম সময়ে সমান কাজ করেছে',
  'Wheel-A, because it did the same work in less time',
  'চাকা-খ, কারণ সে ধীরে কাজ করেছে',
  'Wheel-B, because it worked slowly',
  'দুটি সমান, কারণ দুটিই সমান পানি তুলেছে',
  'Both are equal, because both lifted the same water',
  'a',
  'ক্ষমতা = কাজ ÷ সময়। সমান কাজ কম সময়ে করলে ক্ষমতা বেশি হয়।',
  'Power = Work ÷ Time. Doing the same work in less time means more power.',
  'settings'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'physics_ssc' AND ch.chapter_number = 4;

-- Scene 4: পড়ে যাওয়া আম (The Falling Mango — PE to KE)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 4,
  'পড়ে যাওয়া আম',
  'The Falling Mango',
  'দুপুরে গাছের নিচে বসে থাকতে হঠাৎ একটি পাকা আম রাফির মাথায় পড়লো! "আউচ!" রাফি চিৎকার করলো। কিন্তু তারপরেই সে ভাবলো — আমটি গাছের ডালে থাকা অবস্থায় তার বিভব শক্তি ছিলো। পড়ার সময় সেই বিভব শক্তি গতিশক্তিতে রূপান্তরিত হলো। তাই আঘাত লাগলো!',
  'While sitting under a tree at noon, a ripe mango suddenly falls on Rafi''s head! "Ouch!" he shouts. But then he thinks — while on the branch, the mango had potential energy. While falling, that potential energy was converted to kinetic energy. That''s why it hurt!',
  (SELECT c.id FROM concepts c JOIN chapters ch2 ON c.chapter_id = ch2.id JOIN subjects s2 ON ch2.subject_id = s2.id WHERE s2.code = 'physics_ssc' AND ch2.chapter_number = 4 AND c.name_en = 'Kinetic Energy'),
  'গাছের ডালে ঝুলে থাকা আমটি মাটিতে পড়ার সময় কী ঘটে?',
  'What happens when a mango hanging on a tree branch falls to the ground?',
  'বিভব শক্তি গতিশক্তিতে রূপান্তরিত হয়',
  'Potential energy converts to kinetic energy',
  'গতিশক্তি বিভব শক্তিতে রূপান্তরিত হয়',
  'Kinetic energy converts to potential energy',
  'কোনো শক্তির পরিবর্তন হয় না',
  'No energy change occurs',
  'a',
  'উঁচুতে থাকা বস্তুর বিভব শক্তি থাকে। পড়ার সময় উচ্চতা কমে এবং গতি বাড়ে — তাই বিভব শক্তি গতিশক্তিতে রূপান্তরিত হয়।',
  'Objects at height have potential energy. While falling, height decreases and speed increases — so potential energy converts to kinetic energy.',
  'apple'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'physics_ssc' AND ch.chapter_number = 4;

-- Scene 5: পুরো গ্রামে আলো (Light for the Whole Village — Energy Conservation)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 5,
  'পুরো গ্রামে আলো',
  'Light for the Whole Village',
  'রাফি অবশেষে জল-চাকা তৈরি করলো! খালের পানির গতিশক্তি চাকা ঘুরিয়ে যান্ত্রিক শক্তি তৈরি করে, তারপর ডায়নামো দিয়ে তড়িৎ শক্তি তৈরি হয়, আর সেই তড়িৎ শক্তি বাল্বে আলোক শক্তিতে রূপান্তরিত হয়। গ্রামের মানুষ আনন্দে চিৎকার করে উঠলো! রাফি বুঝলো — শক্তি কখনো সৃষ্টি বা ধ্বংস হয় না, শুধু এক রূপ থেকে অন্য রূপে রূপান্তরিত হয়।',
  'Rafi finally builds the water wheel! The kinetic energy of the stream water turns the wheel creating mechanical energy, then a dynamo converts it to electrical energy, and that electrical energy is transformed into light energy in bulbs. The villagers cheer with joy! Rafi understands — energy is never created or destroyed, it only transforms from one form to another.',
  (SELECT c.id FROM concepts c JOIN chapters ch2 ON c.chapter_id = ch2.id JOIN subjects s2 ON ch2.subject_id = s2.id WHERE s2.code = 'physics_ssc' AND ch2.chapter_number = 4 AND c.name_en = 'Energy Transformation and Conservation'),
  'রাফির জল-চাকা সিস্টেমে শক্তির রূপান্তরের সঠিক ক্রম কোনটি?',
  'What is the correct sequence of energy transformation in Rafi''s water wheel system?',
  'গতিশক্তি → যান্ত্রিক শক্তি → তড়িৎ শক্তি → আলোক শক্তি',
  'Kinetic → Mechanical → Electrical → Light energy',
  'আলোক শক্তি → তড়িৎ শক্তি → যান্ত্রিক শক্তি → গতিশক্তি',
  'Light → Electrical → Mechanical → Kinetic energy',
  'বিভব শক্তি → শব্দ শক্তি → তাপ শক্তি → আলোক শক্তি',
  'Potential → Sound → Heat → Light energy',
  'a',
  'পানির প্রবাহের গতিশক্তি চাকা ঘোরায় (যান্ত্রিক), ডায়নামো তড়িৎ তৈরি করে, এবং বাল্ব আলো দেয়। এটি শক্তি সংরক্ষণ নীতির বাস্তব উদাহরণ।',
  'The flowing water''s kinetic energy turns the wheel (mechanical), the dynamo generates electricity, and the bulb produces light. This is a real example of the principle of conservation of energy.',
  'lightbulb'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'physics_ssc' AND ch.chapter_number = 4;

-- ============================================================
-- BIOLOGY: জীবনীশক্তি (Bioenergetics)
-- ============================================================

-- Scene 1: শুকিয়ে যাওয়া আম গাছের রহস্য (The Mystery of the Dying Mango Tree)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 1,
  'শুকিয়ে যাওয়া আম গাছের রহস্য',
  'The Mystery of the Dying Mango Tree',
  'রাজশাহীর বরেন্দ্র এলাকায় ১৩ বছরের তানিয়ার বাড়ির উঠানে একটি পুরনো আম গাছ আছে। এবার গরমে গাছটির পাতা হলুদ হয়ে ঝরে পড়ছে এবং ফল ধরছে না। তানিয়ার নানু বললেন, "গাছটা যেন শক্তি হারিয়ে ফেলেছে।" তানিয়া তার জীববিজ্ঞান বই খুললো — জীবনীশক্তি অধ্যায়। গাছের শক্তি কোথা থেকে আসে, সেটা বুঝতে হবে!',
  'In the Barind region of Rajshahi, 13-year-old Tania has an old mango tree in her courtyard. This summer, its leaves are turning yellow and falling, and it''s bearing no fruit. Tania''s grandmother says, "The tree seems to have lost its energy." Tania opens her Biology textbook to the Bioenergetics chapter. She needs to understand — where does a tree''s energy come from?',
  NULL,
  'তানিয়ার আম গাছ হলুদ হয়ে যাচ্ছে এবং ফল ধরছে না। এর সবচেয়ে সম্ভাব্য কারণ কী?',
  'Tania''s mango tree is turning yellow and not bearing fruit. What is the most likely reason?',
  'গাছটি সঠিকভাবে খাদ্য তৈরি করতে পারছে না',
  'The tree cannot produce food properly',
  'গাছটি খুব বেশি পানি পাচ্ছে',
  'The tree is getting too much water',
  'গাছটিতে পোকা লেগেছে',
  'The tree has insects',
  'a',
  'পাতা হলুদ হওয়া ক্লোরোফিলের সমস্যার লক্ষণ — যা সালোকসংশ্লেষণে বাধা দেয়। সালোকসংশ্লেষণ ছাড়া গাছ খাদ্য তৈরি করতে পারে না এবং ফল ধরে না।',
  'Yellowing leaves indicate a chlorophyll problem — which hinders photosynthesis. Without photosynthesis, the tree cannot produce food and cannot bear fruit.',
  'tree-deciduous'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'biology_ssc' AND ch.chapter_number = 4;

-- Scene 2: পাতার নিচে চমক (Surprise Under the Leaf — Chlorophyll)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 2,
  'পাতার নিচে চমক',
  'Surprise Under the Leaf',
  'তানিয়া একটি সবুজ পাতা আর একটি হলুদ পাতা পাশাপাশি রাখলো। সে তার নানুর পুরনো আতশি কাচ দিয়ে দেখলো — সবুজ পাতায় ছোট ছোট সবুজ দানা দেখা যাচ্ছে। এগুলো হলো ক্লোরোপ্লাস্ট, যার ভিতরে আছে ক্লোরোফিল — সবুজ রঞ্জক পদার্থ। ক্লোরোফিল সূর্যের আলো শোষণ করে এবং সেই আলোক শক্তিকে রাসায়নিক শক্তিতে রূপান্তরিত করে। হলুদ পাতায় ক্লোরোফিল নষ্ট হয়ে গেছে!',
  'Tania places a green leaf and a yellow leaf side by side. Through her grandmother''s old magnifying glass, she sees tiny green granules in the green leaf. These are chloroplasts, containing chlorophyll — the green pigment. Chlorophyll absorbs sunlight and converts that light energy into chemical energy. The chlorophyll in the yellow leaf has broken down!',
  (SELECT c.id FROM concepts c JOIN chapters ch2 ON c.chapter_id = ch2.id JOIN subjects s2 ON ch2.subject_id = s2.id WHERE s2.code = 'biology_ssc' AND ch2.chapter_number = 4 AND c.name_en = 'Chlorophyll and Light Reaction'),
  'ক্লোরোফিলের প্রধান কাজ কী?',
  'What is the main function of chlorophyll?',
  'সূর্যের আলোক শক্তি শোষণ করে রাসায়নিক শক্তিতে রূপান্তর করা',
  'Absorbing sunlight and converting it to chemical energy',
  'মাটি থেকে পানি শোষণ করা',
  'Absorbing water from the soil',
  'পাতাকে সবুজ রং দেওয়া',
  'Giving leaves their green color',
  'a',
  'ক্লোরোফিল সবুজ রং দেয় ঠিকই, কিন্তু এর মূল কাজ হলো সূর্যের আলোক শক্তি শোষণ করে সালোকসংশ্লেষণের জন্য রাসায়নিক শক্তিতে রূপান্তর করা।',
  'While chlorophyll does give the green color, its primary function is to absorb sunlight energy and convert it to chemical energy for photosynthesis.',
  'eye'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'biology_ssc' AND ch.chapter_number = 4;

-- Scene 3: সূর্যের সাথে সংলাপ (Dialogue with the Sun — Photosynthesis)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 3,
  'সূর্যের সাথে সংলাপ',
  'Dialogue with the Sun',
  'তানিয়া কল্পনা করলো সে সূর্যের সাথে কথা বলছে। সূর্য বললো, "আমি তোমাদের আলো দিই। সবুজ পাতা আমার আলো নিয়ে, বাতাসের CO₂ আর মাটির পানি মিশিয়ে গ্লুকোজ তৈরি করে। সাথে O₂ ত্যাগ করে — যেটা তোমরা শ্বাসে নাও!" তানিয়া সমীকরণটি লিখলো: 6CO₂ + 6H₂O + আলোক শক্তি → C₆H₁₂O₆ + 6O₂। এটাই সালোকসংশ্লেষণ!',
  'Tania imagines she''s talking to the Sun. The Sun says, "I give you light. Green leaves take my light, mix it with CO₂ from the air and water from the soil to create glucose. They release O₂ as a byproduct — which you breathe!" Tania writes the equation: 6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂. This is photosynthesis!',
  (SELECT c.id FROM concepts c JOIN chapters ch2 ON c.chapter_id = ch2.id JOIN subjects s2 ON ch2.subject_id = s2.id WHERE s2.code = 'biology_ssc' AND ch2.chapter_number = 4 AND c.name_en = 'Photosynthesis'),
  'সালোকসংশ্লেষণের উপজাত (byproduct) হিসেবে কী তৈরি হয়?',
  'What is produced as a byproduct of photosynthesis?',
  'অক্সিজেন (O₂)',
  'Oxygen (O₂)',
  'কার্বন ডাই-অক্সাইড (CO₂)',
  'Carbon dioxide (CO₂)',
  'নাইট্রোজেন (N₂)',
  'Nitrogen (N₂)',
  'a',
  'সালোকসংশ্লেষণে সবুজ উদ্ভিদ CO₂ ও H₂O থেকে গ্লুকোজ তৈরি করে এবং উপজাত হিসেবে O₂ মুক্ত করে, যা প্রাণীরা শ্বাসকার্যে ব্যবহার করে।',
  'In photosynthesis, green plants create glucose from CO₂ and H₂O and release O₂ as a byproduct, which animals use for breathing.',
  'sun'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'biology_ssc' AND ch.chapter_number = 4;

-- Scene 4: রাতের গাছ (The Tree at Night — Respiration)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 4,
  'রাতের গাছ',
  'The Tree at Night',
  'রাতে তানিয়া জানালা দিয়ে আম গাছটির দিকে তাকালো। "গাছ তো রাতে সালোকসংশ্লেষণ করতে পারে না — তাহলে রাতে গাছ বেঁচে থাকে কিভাবে?" তানিয়ার মনে প্রশ্ন জাগলো। উত্তর হলো — শ্বসন! গাছ দিনরাত ২৪ ঘণ্টা শ্বসন করে। শ্বসনে গ্লুকোজ ভেঙে শক্তি (ATP) মুক্ত হয় এবং CO₂ ও H₂O তৈরি হয়। শ্বসন সমীকরণ: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + শক্তি (ATP)',
  'At night, Tania looks at the mango tree through the window. "The tree can''t photosynthesize at night — then how does it stay alive at night?" she wonders. The answer is — respiration! Trees respire 24 hours a day. In respiration, glucose is broken down to release energy (ATP) and CO₂ and H₂O are produced. Respiration equation: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP)',
  (SELECT c.id FROM concepts c JOIN chapters ch2 ON c.chapter_id = ch2.id JOIN subjects s2 ON ch2.subject_id = s2.id WHERE s2.code = 'biology_ssc' AND ch2.chapter_number = 4 AND c.name_en = 'Respiration'),
  'সালোকসংশ্লেষণ আর শ্বসনের মধ্যে প্রধান পার্থক্য কোনটি?',
  'What is the main difference between photosynthesis and respiration?',
  'সালোকসংশ্লেষণে খাদ্য তৈরি হয়, শ্বসনে খাদ্য ভেঙে শক্তি মুক্ত হয়',
  'Photosynthesis creates food, respiration breaks down food to release energy',
  'সালোকসংশ্লেষণ রাতে হয়, শ্বসন দিনে হয়',
  'Photosynthesis happens at night, respiration happens during the day',
  'দুটি একই প্রক্রিয়ার ভিন্ন নাম',
  'Both are different names for the same process',
  'a',
  'সালোকসংশ্লেষণ একটি গঠনমূলক প্রক্রিয়া (খাদ্য তৈরি করে) আর শ্বসন একটি ভাঙনমূলক প্রক্রিয়া (খাদ্য ভেঙে ATP শক্তি মুক্ত করে)। শ্বসন দিনরাত ২৪ ঘণ্টা চলে।',
  'Photosynthesis is an anabolic process (creates food) while respiration is a catabolic process (breaks down food to release ATP energy). Respiration occurs 24 hours a day.',
  'moon'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'biology_ssc' AND ch.chapter_number = 4;

-- Scene 5: কোষের ATP (The Cell''s Energy Currency — ATP)
INSERT INTO story_scenes (chapter_id, scene_index, title_bn, title_en, narrative_bn, narrative_en, concept_id, question_bn, question_en, option_a_bn, option_a_en, option_b_bn, option_b_en, option_c_bn, option_c_en, correct_option, explanation_bn, explanation_en, icon_name)
SELECT
  ch.id, 5,
  'কোষের শক্তির মুদ্রা',
  'The Cell''s Energy Currency',
  'তানিয়া এখন পুরো ছবিটি দেখতে পাচ্ছে! ধানক্ষেতে কৃষকরা যেমন টাকা দিয়ে জিনিস কেনে, কোষেও শক্তির একটি "মুদ্রা" আছে — ATP (অ্যাডিনোসিন ট্রাইফসফেট)। শ্বসনে গ্লুকোজ ভেঙে ATP তৈরি হয়। এই ATP দিয়ে কোষ সবকিছু করে — পেশী সংকোচন, স্নায়ু সংকেত পাঠানো, নতুন কোষ তৈরি। তানিয়া বুঝলো কেন আম গাছটি দুর্বল — যথেষ্ট ATP তৈরি হচ্ছে না!',
  'Tania can now see the full picture! Just as farmers in the paddy fields use money to buy things, cells have an energy "currency" — ATP (Adenosine Triphosphate). Respiration breaks down glucose to produce ATP. Cells use ATP for everything — muscle contraction, sending nerve signals, creating new cells. Tania understands why the mango tree is weak — it''s not producing enough ATP!',
  (SELECT c.id FROM concepts c JOIN chapters ch2 ON c.chapter_id = ch2.id JOIN subjects s2 ON ch2.subject_id = s2.id WHERE s2.code = 'biology_ssc' AND ch2.chapter_number = 4 AND c.name_en = 'ATP and Energy Flow'),
  'ATP-কে কোষের "শক্তির মুদ্রা" বলা হয় কেন?',
  'Why is ATP called the "energy currency" of the cell?',
  'কারণ কোষের সকল শক্তি-নির্ভর কাজে ATP ব্যবহৃত হয়',
  'Because ATP is used in all energy-dependent activities of the cell',
  'কারণ ATP দেখতে মুদ্রার মতো',
  'Because ATP looks like a coin',
  'কারণ ATP শুধু উদ্ভিদ কোষে পাওয়া যায়',
  'Because ATP is found only in plant cells',
  'a',
  'ATP কোষের সার্বজনীন শক্তি বাহক। যেকোনো শক্তি-নির্ভর কোষীয় কাজে ATP ভেঙে শক্তি সরবরাহ করে — ঠিক যেমন টাকা দিয়ে যেকোনো জিনিস কেনা যায়।',
  'ATP is the universal energy carrier of cells. It breaks down to supply energy for any energy-dependent cellular activity — just like money can be used to buy anything.',
  'sparkles'
FROM chapters ch JOIN subjects s ON ch.subject_id = s.id
WHERE s.code = 'biology_ssc' AND ch.chapter_number = 4;
