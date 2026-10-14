const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '../qualifications_raw.csv'), 'utf8');
const lines = raw.split(/\r?\n/);

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const teachers = [];
let currentTeacher = null;
let currentProgram = 'สาขาวิชาการศึกษา';

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const cols = parseCsvLine(line);
  const name = cols[1];
  const prog = cols[2];
  const degreeLevel = cols[3];
  const gradYear = cols[4];
  const degreeName = cols[5];
  const major = cols[6];
  const institution = cols[7];

  if (prog && prog.trim() && prog.includes('ประจำหลักสูตร')) {
    currentProgram = prog.replace(/^\d+\.\s*/, '').replace(/^ประจำหลักสูตร/, '').trim();
  }

  if (name && name.trim()) {
    currentTeacher = {
      id: 'EDU-' + String(teachers.length + 1).padStart(3, '0'),
      name: name.replace(/^"|"$/g, '').trim(),
      program: currentProgram,
      degrees: []
    };
    teachers.push(currentTeacher);
  }

  if (currentTeacher && degreeLevel) {
    currentTeacher.degrees.push({
      level: degreeLevel,
      year: gradYear || '',
      degree: (degreeName || '').replace(/^"|"$/g, '').trim(),
      major: (major || '').replace(/^"|"$/g, '').trim(),
      institution: (institution || '').replace(/^"|"$/g, '').trim()
    });
  }
}

const outDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'teachers.json'), JSON.stringify(teachers, null, 2), 'utf8');
console.log('Successfully saved ' + teachers.length + ' teachers to src/data/teachers.json');
