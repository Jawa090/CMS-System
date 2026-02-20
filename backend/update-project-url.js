// Update Project URL Script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateProjectUrl() {
  try {
    // Get all projects
    const projects = await prisma.project.findMany();
    
    console.log('\n📋 Current Projects:\n');
    projects.forEach((project, idx) => {
      console.log(`${idx + 1}. ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Current URL: ${project.siteUrl}`);
      console.log('');
    });

    // Example: Update first project
    if (projects.length > 0) {
      const projectId = projects[0].id;
      const newUrl = 'https://your-live-site.com'; // CHANGE THIS
      
      console.log(`\n🔄 To update project URL, uncomment the code below and change the URL\n`);
      
      // Uncomment these lines and change the URL:
      /*
      const updated = await prisma.project.update({
        where: { id: projectId },
        data: { siteUrl: newUrl }
      });
      
      console.log('✅ Project URL Updated!');
      console.log(`   New URL: ${updated.siteUrl}`);
      */
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjectUrl();
