import { ALL_SKILLS, MAIN_SKILLS } from '../../data/profile';
import './Skills.css';

export default function Skills() {
  return (
    <section id="skills" className="panel">
      <h2>Tech Arsenal</h2>
      <div className="main-skill-grid">
        {MAIN_SKILLS.map((skill) => (
          <article key={skill.title} className="main-skill-card">
            <h4>{skill.title}</h4>
            <p>{skill.items}</p>
          </article>
        ))}
      </div>

      <div className="tags all-skills">
        {ALL_SKILLS.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </section>
  );
}
