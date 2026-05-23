-- Subjects (SSC only for MVP)
INSERT INTO subjects (code, name_bn, name_en, grade, paper) VALUES
('physics_ssc', 'পদার্থবিজ্ঞান', 'Physics', 'ssc', NULL),
('biology_ssc', 'জীববিজ্ঞান', 'Biology', 'ssc', NULL);

-- Physics Chapter 4: Work, Power and Energy
INSERT INTO chapters (subject_id, chapter_number, title_bn, title_en, summary_bn, summary_en, page_start, page_end, pdf_status)
SELECT 
  id, 4,
  'কাজ, ক্ষমতা ও শক্তি',
  'Work, Power and Energy',
  'এই অধ্যায়ে আমরা কাজ, ক্ষমতা ও শক্তির পারস্পরিক সম্পর্ক, কাজ-শক্তি উপপাদ্য, শক্তির রূপান্তর এবং শক্তি সংরক্ষণের নীতি সম্পর্কে শিখব।',
  'In this chapter we explore the interrelation of work, power, and energy, the work-energy theorem, transformation of energy, and the principle of conservation of energy.',
  98, 126, 'pending'
FROM subjects WHERE code = 'physics_ssc';

-- Biology Chapter 4: Bioenergetics
INSERT INTO chapters (subject_id, chapter_number, title_bn, title_en, summary_bn, summary_en, page_start, page_end, pdf_status)
SELECT 
  id, 4,
  'জীবনীশক্তি',
  'Bioenergetics',
  'এই অধ্যায়ে সালোকসংশ্লেষণ ও শ্বসন প্রক্রিয়া, ATP-এর ভূমিকা, এবং জীবদেহে শক্তির প্রবাহ সম্পর্কে আলোচনা করা হবে।',
  'This chapter covers photosynthesis and respiration, the role of ATP, and the flow of energy in living organisms.',
  64, 83, 'pending'
FROM subjects WHERE code = 'biology_ssc';

-- Concepts for Physics Chapter 4
WITH ch AS (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE s.code = 'physics_ssc' AND c.chapter_number = 4)
INSERT INTO concepts (chapter_id, name_bn, name_en, description_bn, description_en, difficulty, display_order)
SELECT ch.id, 'কাজ', 'Work', 'বল প্রয়োগের ফলে বস্তুর সরণ ঘটলে কাজ হয়।', 'Work is done when a force causes displacement of an object.', 2, 1 FROM ch
UNION ALL
SELECT ch.id, 'ক্ষমতা', 'Power', 'একক সময়ে সম্পাদিত কাজের পরিমাণই ক্ষমতা।', 'Power is the amount of work done per unit time.', 3, 2 FROM ch
UNION ALL
SELECT ch.id, 'গতিশক্তি', 'Kinetic Energy', 'গতিশীল বস্তুর কারণে যে শক্তি তাকে গতিশক্তি বলে।', 'Kinetic energy is the energy possessed by a body due to its motion.', 3, 3 FROM ch
UNION ALL
SELECT ch.id, 'বিভব শক্তি', 'Potential Energy', 'অবস্থানের কারণে কোনো বস্তুতে সঞ্চিত শক্তিই বিভব শক্তি।', 'Potential energy is the stored energy of an object due to its position.', 3, 4 FROM ch
UNION ALL
SELECT ch.id, 'শক্তির রূপান্তর ও সংরক্ষণ', 'Energy Transformation and Conservation', 'শক্তি এক রূপ থেকে অন্য রূপে রূপান্তরিত হয় কিন্তু মোট শক্তি অপরিবর্তিত থাকে।', 'Energy can be transformed from one form to another, but the total amount remains constant.', 4, 5 FROM ch;

-- Concepts for Biology Chapter 4
WITH ch AS (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE s.code = 'biology_ssc' AND c.chapter_number = 4)
INSERT INTO concepts (chapter_id, name_bn, name_en, description_bn, description_en, difficulty, display_order)
SELECT ch.id, 'সালোকসংশ্লেষণ', 'Photosynthesis', 'সবুজ উদ্ভিদ সূর্যালোকে CO2 ও পানি ব্যবহার করে গ্লুকোজ ও অক্সিজেন তৈরি করে।', 'Green plants use sunlight, CO2, and water to produce glucose and oxygen.', 3, 1 FROM ch
UNION ALL
SELECT ch.id, 'ক্লোরোফিল ও আলোক বিক্রিয়া', 'Chlorophyll and Light Reaction', 'ক্লোরোফিল আলোর শক্তি শোষণ করে রাসায়নিক শক্তিতে রূপান্তর করে।', 'Chlorophyll absorbs light energy and converts it to chemical energy.', 4, 2 FROM ch
UNION ALL
SELECT ch.id, 'অন্ধকার বিক্রিয়া (ক্যালভিন চক্র)', 'Dark Reaction (Calvin Cycle)', 'CO2 থেকে গ্লুকোজ তৈরির প্রক্রিয়া যেখানে আলো সরাসরি প্রয়োজন হয়বিধা।', 'The process of glucose formation from CO2 that does not directly require light.', 4, 3 FROM ch
UNION ALL
SELECT ch.id, 'শ্বসন প্রক্রিয়া', 'Respiration', 'গ্লুকোজ ভেঙে শক্তি (ATP) মুক্ত করার প্রক্রিয়া।', 'The process of breaking down glucose to release energy (ATP).', 3, 4 FROM ch
UNION ALL
SELECT ch.id, 'ATP ও শক্তি প্রবাহ', 'ATP and Energy Flow', 'কোষের শক্তির মুদ্রা ATP এবং এর মাধ্যমে কোষীয় প্রক্রিয়া পরিচালনা।', 'ATP is the energy currency of the cell, used to power cellular processes.', 5, 5 FROM ch;
