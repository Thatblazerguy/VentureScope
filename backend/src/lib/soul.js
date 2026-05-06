const fs = require('fs');

function formatYamlValue(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => JSON.stringify(String(item).trim())).join(', ')}]`;
  }

  if (value === null || value === undefined || value === '') {
    return 'null';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(String(value));
}

function parseYamlValue(value) {
  if (!value || value === 'null') {
    return null;
  }

  if (value === '[]') {
    return [];
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  }

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value.slice(1, -1);
    }
  }

  return value;
}

function buildSoulMarkdown(profile = {}) {
  const userProfile = profile.user_profile || {};
  const yaml = [
    'user_profile:',
    `  domains: ${formatYamlValue(userProfile.domains || [])}`,
    `  interests: ${formatYamlValue(userProfile.interests || [])}`,
    `  exclusions: ${formatYamlValue(userProfile.exclusions || [])}`,
    `  risk_appetite: ${formatYamlValue(userProfile.risk_appetite || 'medium')}`,
    `  behavior_signals: ${formatYamlValue(userProfile.behavior_signals || [])}`,
    `  discovery_preferences: ${formatYamlValue(userProfile.discovery_preferences || [])}`,
    `  last_updated: ${formatYamlValue(userProfile.last_updated || null)}`,
  ].join('\n');

  return `# SOUL\n\n## Purpose\nSOUL stores user intelligence for OpenClaw so the system can adapt discovery behavior over time.\n\n## Memory Structure\n\n\n\`\`\`yaml\n${yaml}\n\`\`\`\n\n## Usage Rules\n- OpenClaw writes updates after each meaningful discovery cycle.\n- The backend reads this file only for presentation and context.\n- Domain and behavior signals should be appended as they evolve.\n- Keep the schema simple and easy to extend.\n`;
}

function parseSoulProfile(markdown) {
  const yamlMatch = markdown.match(/```yaml\s*([\s\S]*?)```/);
  if (!yamlMatch) {
    return {};
  }

  const profile = {};
  const userProfile = {};
  const lines = yamlMatch[1].split(/\r?\n/);
  let inUserProfile = false;

  for (const rawLine of lines) {
    if (!rawLine.trim()) {
      continue;
    }

    const isIndented = rawLine.startsWith('  ');
    const line = rawLine.trim();

    if (line === 'user_profile:') {
      inUserProfile = true;
      continue;
    }

    if (!isIndented) {
      inUserProfile = false;
    }

    const entryMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!entryMatch) {
      continue;
    }

    const [, key, value] = entryMatch;
    if (inUserProfile && isIndented) {
      userProfile[key] = parseYamlValue(value);
    } else {
      profile[key] = parseYamlValue(value);
    }
  }

  if (Object.keys(userProfile).length > 0) {
    profile.user_profile = userProfile;
  }

  return profile;
}

function loadSoulMemory(filePath) {
  const markdown = fs.readFileSync(filePath, 'utf8');
  return {
    path: filePath,
    markdown,
    profile: parseSoulProfile(markdown),
  };
}

function updateSoulMemory(filePath, partialProfile = {}) {
  const current = loadSoulMemory(filePath);
  const nextProfile = {
    ...current.profile,
    user_profile: {
      ...(current.profile.user_profile || {}),
      ...(partialProfile.user_profile || {}),
      last_updated: new Date().toISOString(),
    },
  };

  const markdown = buildSoulMarkdown(nextProfile);
  fs.writeFileSync(filePath, markdown, 'utf8');

  return {
    path: filePath,
    markdown,
    profile: parseSoulProfile(markdown),
  };
}

module.exports = {
  buildSoulMarkdown,
  loadSoulMemory,
  parseSoulProfile,
  updateSoulMemory,
};