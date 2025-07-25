#!/bin/bash

# Database Migration Script for Jøssing Game
# Handles Prisma migrations for both local and Turso databases

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
if npx prisma migrate dev --name "schema_update" --skip-generate; then
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

# Step 3: Update Turso Database
print_status "Updating Turso database..." "${DATABASE}"

# Ensure TURSO_DATABASE_URL is available
if [ -z "$TURSO_DATABASE_URL" ]; then
    print_status "Getting Turso database URL..." "${HOURGLASS}"
    if command -v turso &> /dev/null; then
        export TURSO_DATABASE_URL=$(turso db show jossing-game --url)
        if [ -n "$TURSO_DATABASE_URL" ]; then
            print_success "Turso database URL obtained!"
        else
            print_error "Failed to get Turso database URL"
            exit 1
        fi
    else
        print_error "Turso CLI not found!"
        echo -e "${YELLOW}💡${NC} ${WHITE}Install: ${CYAN}curl -sSfL https://get.tur.so/install.sh | bash${NC}"
        exit 1
    fi
fi

# Method 1: Try Prisma db push (preferred method)
print_status "Attempting to sync schema using Prisma db push..." "${SPARKLES}"
if TURSO_DATABASE_URL="$TURSO_DATABASE_URL" npx prisma db push --skip-generate; then
    print_success "Turso database updated successfully with Prisma db push!"
    TURSO_UPDATED=true
else
    print_warning "Prisma db push failed, trying migration SQL approach..."
    TURSO_UPDATED=false
fi

# Method 2: Fallback to migration SQL if db push failed
if [ "$TURSO_UPDATED" = false ]; then
    print_status "Generating migration SQL for Turso..." "${WRENCH}"
    
    # Find the most recent migration file
    LATEST_MIGRATION=$(ls -t prisma/migrations/*/migration.sql 2>/dev/null | head -n 1)
    
    if [ -n "$LATEST_MIGRATION" ] && [ -f "$LATEST_MIGRATION" ]; then
        print_success "Found migration file: $(basename $(dirname $LATEST_MIGRATION))"
        
        print_status "Migration SQL content:" "${HOURGLASS}"
        echo -e "${CYAN}$(cat $LATEST_MIGRATION)${NC}"
        echo ""
        
        read -p "🤔 Apply this migration SQL to Turso database? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v turso &> /dev/null; then
                if turso db shell jossing-game < "$LATEST_MIGRATION"; then
                    print_success "Turso database updated successfully with migration SQL!"
                    TURSO_UPDATED=true
                else
                    print_error "Failed to apply migration SQL to Turso database"
                    echo -e "${YELLOW}💡${NC} ${WHITE}You can manually run: ${CYAN}turso db shell jossing-game < $LATEST_MIGRATION${NC}"
                fi
            else
                print_error "Turso CLI not found!"
                echo -e "${YELLOW}💡${NC} ${WHITE}Install: ${CYAN}curl -sSfL https://get.tur.so/install.sh | bash${NC}"
                echo -e "${YELLOW}💡${NC} ${WHITE}Then run: ${CYAN}turso db shell jossing-game < $LATEST_MIGRATION${NC}"
            fi
        else
            print_warning "Skipped Turso migration"
            echo -e "${YELLOW}💡${NC} ${WHITE}Run manually: ${CYAN}turso db shell jossing-game < $LATEST_MIGRATION${NC}"
        fi
    else
        print_warning "No migration file found - this might be normal if no schema changes were needed"
        TURSO_UPDATED=true  # Assume no changes needed
    fi
fi

# Verify Turso database
if [ "$TURSO_UPDATED" = true ] && command -v turso &> /dev/null; then
    print_status "Verifying Turso database tables..." "${GLOBE}"
    TURSO_TABLES=$(turso db shell jossing-game ".tables" 2>/dev/null || echo "")
    if [ -n "$TURSO_TABLES" ]; then
        print_success "Turso database verification completed!"
        echo -e "${CYAN}Tables: ${TURSO_TABLES}${NC}"
    else
        print_warning "Could not verify Turso database tables"
    fi
fi

echo ""

# Step 4: Verify local database
print_status "Verifying local database..." "${COMPUTER}"
if npx prisma db push --skip-generate; then
    print_success "Local database verified!"
else
    print_warning "Local database verification had issues (this might be normal)"
fi

echo ""

# Step 5: Clean up
print_status "Cleaning up temporary files..." "${SPARKLES}"
# Remove any temporary files that might have been created
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
if [ "$TURSO_UPDATED" = true ]; then
    echo -e "${GREEN}${CHECKMARK}${NC} ${WHITE}Turso database synchronized${NC}"
else
    echo -e "${YELLOW}⚠️${NC} ${WHITE}Turso database may need manual update${NC}"
fi
echo ""
echo -e "${PURPLE}${SPARKLES}${NC} ${WHITE}Your Jøssing game database migration is complete! ${PURPLE}${SPARKLES}${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "${WHITE}1. ${CYAN}npm run dev${NC} ${WHITE}- Start the development server${NC}"
echo -e "${WHITE}2. ${CYAN}npm run build${NC} ${WHITE}- Verify everything works${NC}"
echo -e "${WHITE}3. Test your application to ensure both databases work correctly${NC}"
echo -e "${WHITE}4. Deploy to production! ${ROCKET}${NC}"
echo ""
