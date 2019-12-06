library(readr)

library(lubridate)

library(parsedate)



#source_file_path <-"//iqdvmappp01its/qualdash/home/data/source/"
source_file_path <- "D:/Bitnami/wampstack-7.1.30-0/apache2/htdocs/qualdash/home/data/source/"
#dest_file_path <- "//iqdvmappp01its/qualdash/home/data/picanet_admission/"
dest_file_path <- "D:/Bitnami/wampstack-7.1.30-0/apache2/htdocs/qualdash/home/data/picanet_admission/"
#dest_activity_path <- "//iqdvmappp01its/qualdash/home/data/picanet_activity/"
dest_activity_path <- "D:/Bitnami/wampstack-7.1.30-0/apache2/htdocs/qualdash/home/data/picanet_activity/"
audit_filename <- "admission.csv"

#dateFormat <- "%d-%m-%y %H:%M"

dateFormat <- "%d/%m/%Y %H:%M:%S"


source = paste(source_file_path, audit_filename, sep='')

# read raw admission data from its current location

admission <- read_csv(source)


# get years in data
admdate <- as.Date(paste(admission$AdDate), dateFormat)
adyear <- year(admdate)

admission <- cbind(admission, adyear, invVentStart = as.Date("1900-01-01"), invVentEnd = as.Date("1900-01-01"),  invVentEncounter =0)



allDates <- lapply(admission, function(x) !all(is.na(as.Date(as.character(x), format =dateFormat))))
df <- as.data.frame(allDates)
colnames(df) <- colnames(admission)
dateFields <- df[which(df==TRUE)]



# Unify date formats to ISO format

for(col in colnames(admission)){
  
  if(col %in% colnames(dateFields)){
    
    vector <- admission[col]
    
    temp <- lapply(vector, function(x) as.POSIXlt(x, format=dateFormat))
    
    admission[col] <- temp
  }
}

# break it into seperate files for individual years
  # and store the new files in the picanet folder 
for(year in unique(admission$adyear)){
  tmp = subset(admission, adyear == year)     
  fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
  write.csv(tmp, fn, row.names = FALSE)
}


########
yfn = paste(dest_file_path ,'avail_years.csv', sep='' )
# read in values already in avail_years
av <- read_csv(yfn)
temp <- av$x
for(year in unique(admission$adyear)){
  if(!(year %in% av$x))
    temp <- c(av$x, year)
}
write.csv(temp, yfn, row.names = FALSE)


# read raw activity data
source = paste(source_file_path, "activity.csv", sep='')
activity <- read_csv(source)

# split activity file by year of admission
myvars <- c("adyear", "EventID")
newdata <- admission[myvars]
df <- merge(newdata, activity, by='EventID')

# get the latest year in your data
#maxyear <- max(admission$adyear, na.rm = TRUE)



###########################################
M <- merge(admission, activity, by=c('EventID'), all.x=T)
  
  # select only relevant columns for QualDash
  d = data.frame(M$EventID, M$ActivityDate , M$AdDate,   M$ActivityDate, M$PccHrg, M$InvVentET, M$InvVentTT)
  colnames(d) <- c('EventID', 'ActivityDate' , 'adDate', 'invVentStart', 'hrggroup', 'InvVentET', 'InvVentTT')
  ventEvt <- d$InvVentET | d$InvVentTT
  
id <- d$EventID
row <- 1
while( row  < nrow(d)){
  thisptID <- id[row]
  thisptcount <- 0
  
  # if a ventilation event is encountered
  while(ventEvt[row] & d$EventID[row] == thisptID ){
	thisptcount <- thisptcount + 1
	if(admission[which(admission$EventID == thisptID), 'invVentEncounter'] == 0){
        admission[which(admission$EventID == thisptID), 'invVentEncounter'] <- 1
        admission[which(admission$EventID == thisptID), 'invVentStart'] <- as.Date(d$ActivityDate[row], format = dateFormat)
		#print(as.POSIXlt(d$ActivityDate[row], format = dateFormat))
		#print(admission[which(admission$EventID == thisptID), 'invVentStart'])
      }
	
	# if this date is before the patient's current start date, record this as the new start date of the event
	thisptStart = as.Date(admission[which(admission$EventID == thisptID), 'invVentStart'], format = dateFormat);
	newDate = as.Date(d$ActivityDate[row], format = dateFormat);
	if(newDate < thisptStart){
	  admission[which(admission$EventID == thisptID), 'invVentStart'] <- as.Date(d$ActivityDate[row], format = dateFormat)
	}

	# if this date is past the current end of event, record the current row as the end of the event 
	thisptEnd = as.Date(admission[which(admission$EventID == thisptID), 'invVentEnd'], format = dateFormat);
    if(newDate > thisptEnd)
		admission[which(admission$EventID == thisptID), 'invVentEnd'] <- as.Date(d$ActivityDate[row], format = dateFormat)
	
	row <- row + 1
	}
  
  # if there is no more ventilation, move on to the next row
  if(!ventEvt[row])
	row <- row + 1
  #otherwise this is a new patient with ventilation event, in which case the loop iterates with the current row 
}
#admission$invVentStart <- lapply(admission$invVentStart, function(x) as.POSIXlt(x, format=dateFormat))
#admission$invVentEnd <- lapply(admission$invVentEnd, function(x) as.POSIXlt(x, format=dateFormat))

###########################################

for(year in unique(df$adyear)){
  # read the admission records for the current year alone
  fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
  cur_adm <- read.csv(fn)
  # merge the activity file
  M <- merge(cur_adm, activity, by=c('EventID'), all.x=T)
  
  # select only relevant columns for QualDash
  d = data.frame(M$EventID, M$ActivityDate , M$AdDate,   M$ActivityDate, M$PccHrg, M$InvVentET, M$InvVentTT)
  colnames(d) <- c('EventID', 'ActivityDate' , 'adDate', 'invVentStart', 'hrggroup', 'InvVentET', 'InvVentTT')
  
  for(level in unique(d$hrggroup)){
    admission[, toString(level) ] <- 0
  }	

   for(row in 1:nrow(d)){
   id <- d$EventID[row] 
    level <- d$hrggroup[row]
    lev <- toString(level[1])
    # record the number of days at dependency level lev
    admission[which(admission$EventID == id), lev] <- 1 + admission[which(admission$EventID == id), lev]
    
    }
    
  
  tmp = subset(admission, adyear == year)     
  fn = paste(dest_file_path, gsub(' ','', year), '.csv', sep='' )
  write.csv(tmp, fn, row.names = FALSE)
  
  fn = paste(dest_activity_path, 'shortactiv' , gsub(' ','', year), '.csv', sep='' )
  write.csv(d, fn)
}


