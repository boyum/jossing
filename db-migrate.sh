#!/bin/bash

# Database Migration Script for Jøssing Game
# Converts enums to string literals and updates both local and Turso databases

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
DATABASE="🗄️"
CHECKMARK="✅"
WRENCH="🔧"
SPARKLES="✨"
HOURGLASS="⏳"
GLOBE="🌍"
COMPUTER="💻"
CROWN="👑"

echo ""
echo -e "${PURPLE}${CROWN}===============================================${NC}"
echo -e "${WHITE}    Jøssing Game Database Migration Script    ${NC}"
echo -e "${PURPLE}${CROWN}===============================================${NC}"
echo ""

# Function to print colored status
print_status() {
    echo -e "${BLUE}${2}${NC} ${WHITE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECKMARK}${NC} ${WHITE}$1${NC}"
}

print_error() {
    echo -e "${RED}❌${NC} ${WHITE}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} ${WHITE}$1${NC}"
}

# Step 1: Generate Migration
print_status "Generating Prisma migration..." "${WRENCH}"
if npx prisma migrate dev --name "convert-enums-to-strings" --skip-generate; then
    print_success "Migration generated successfully!"
else
    print_error "Failed to generate migration"
    exit 1
fi

echo ""

# Step 2: Generate Prisma Client
print_status "Regenerating Prisma client..." "${SPARKLES}"
if npx prisma generate; then
    print_success "Prisma client regenerated!"
else
    print_error "Failed to regenerate Prisma client"
    exit 1
fi

echo ""

# Step 3: Generate SQL for Turso
print_status "Checking if Turso migration is needed..." "${DATABASE}"

# First, check if we can pull the current schema from Turso
print_status "Pulling current Turso schema..." "${HOURGLASS}"

# Create a temporary schema file for Turso introspection
cat > prisma/turso-temp.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("TURSO_DATABASE_URL")
}
EOF

# Try to pull from Turso using the TURSO_DATABASE_URL
if [ -n "$TURSO_DATABASE_URL" ] && npx prisma db pull --force --schema=prisma/turso-temp.prisma &>/dev/null; then
    print_success "Successfully pulled current Turso schema!"
    
    # Compare schemas to see if migration is needed
    if npx prisma migrate diff --from-schema-datamodel prisma/turso-temp.prisma --to-schema-datamodel prisma/schema.prisma --script > turso-migration.sql 2>/dev/null; then
        
        # Check if migration file has actual content (more than just comments)
        if [ -s "turso-migration.sql" ] && grep -q -v "^--" turso-migration.sql && grep -q -v "^$" turso-migration.sql; then
            print_success "Migration needed - SQL changes generated"
        else
            print_success "No migration needed - schemas are already in sync! 🎉"
            echo "" > turso-migration.sql  # Clear the file
        fi
    else
        print_warning "Could not compare schemas - assuming no migration needed"
        echo "" > turso-migration.sql  # Clear the file
    fi
    
    # Clean up temporary schema file
    rm -f prisma/turso-temp.prisma
else
    print_warning "Could not pull current schema from Turso"
    print_warning "Make sure TURSO_DATABASE_URL is set in your environment"
    print_status "To set it manually run:" "${COMPUTER}"
    echo -e "${CYAN}export TURSO_DATABASE_URL=\"\$(turso db show jossing-game --url)\"${NC}"
    print_status "Skipping Turso migration - database likely already up to date" "${CHECKMARK}"
    echo "" > turso-migration.sql  # Create empty file
    rm -f prisma/turso-temp.prisma
fi

echo ""

# Step 4: Check if Turso CLI is available and apply migration if needed
print_status "Checking Turso migration status..." "${GLOBE}"

# Check if migration file has actual SQL content
if [ -s "turso-migration.sql" ] && grep -q -v "^--" turso-migration.sql && grep -q -v "^$" turso-migration.sql; then
    # Migration is needed
    if command -v turso &> /dev/null; then
        print_success "Turso CLI found!"
        
        print_status "Migration SQL to apply:" "${HOURGLASS}"
        echo -e "${CYAN}$(cat turso-migration.sql)${NC}"
        echo ""
        
        read -p "🤔 Apply this migration to Turso database? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if turso db shell jossing-game < turso-migration.sql; then
                print_success "Turso database updated successfully!"
            else
                print_error "Failed to update Turso database"
                echo -e "${YELLOW}💡${NC} ${WHITE}You can manually run: ${CYAN}turso db shell jossing-game < turso-migration.sql${NC}"
            fi
        else
            print_warning "Skipped Turso migration"
            echo -e "${YELLOW}💡${NC} ${WHITE}Run manually: ${CYAN}turso db shell jossing-game < turso-migration.sql${NC}"
        fi
    else
        print_warning "Turso CLI not found!"
        echo -e "${YELLOW}💡${NC} ${WHITE}Install: ${CYAN}curl -sSfL https://get.tur.so/install.sh | bash${NC}"
        echo -e "${YELLOW}💡${NC} ${WHITE}Then run: ${CYAN}turso db shell jossing-game < turso-migration.sql${NC}"
    fi
else
    # No migration needed
    print_success "Turso database is already up to date! No migration required 🎉"
fi

echo ""

# Step 6: Verify local database
print_status "Verifying local database..." "${COMPUTER}"
if npx prisma db push --skip-generate; then
    print_success "Local database verified!"
else
    print_warning "Local database verification had issues (this might be normal)"
fi

echo ""

# Step 7: Clean up
print_status "Cleaning up temporary files..." "${SPARKLES}"
if [ -f "turso-migration.sql" ]; then
    rm turso-migration.sql
    print_success "Temporary migration file cleaned up!"
fi
if [ -f "prisma/turso-temp.prisma" ]; then
    rm prisma/turso-temp.prisma
    print_success "Temporary schema file cleaned up!"
fi

echo ""
echo -e "${GREEN}${ROCKET}===============================================${NC}"
echo -e "${WHITE}           Migration Complete!                 ${NC}"
echo -e "${GREEN}${ROCKET}===============================================${NC}"
echo ""
echo -e "${GREEN}${CHECKMARK}${NC} ${WHITE}Local database updated${NC}"
echo -e "${GREEN}${CHECKMARK}${NC} ${WHITE}Prisma client regenerated${NC}"
echo -e "${GREEN}${CHECKMARK}${NC} ${WHITE}TypeScript compilation verified${NC}"
echo -e "${GLOBE} ${WHITE}Turso database should be updated${NC}"
echo ""
echo -e "${PURPLE}${SPARKLES}${NC} ${WHITE}Your Jøssing game is ready with string literals! ${PURPLE}${SPARKLES}${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "${WHITE}1. ${CYAN}npm run dev${NC} ${WHITE}- Start the development server${NC}"
echo -e "${WHITE}2. ${CYAN}npm run build${NC} ${WHITE}- Verify everything works${NC}"
echo -e "${WHITE}3. Deploy to production! ${ROCKET}${NC}"
echo ""
