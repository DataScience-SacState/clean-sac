#! /usr/bin/env python

# use the regex module
import re
import requests
import json
import numpy as np
import pandas as pd
#import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN
from scipy.spatial import distance

#DATA_URL = "http://10.113.219.153:3000/reports.json"
DATA_URL = "http://159.203.247.240:3000/reports.json"

def parseGPX():
    # read in the file
    in_file = open('latLong.gpx').read()
    # or use string as input
    # Find matches using regex
    #matches = re.findall('<trkpt lat="([-0-9\.]+)" lon="([-0-9\.]+)"/>', in_file)
    matches = re.findall('<wpt lat="([-0-9\.]+)" lon="([-0-9\.]+)">', in_file)

    # make new file lines by combining lat and lon from matches
    out_lines = [lon + ',' + lat for lat, lon in matches]

    # convert array of strings to single string
    out_lines = '\n'.join(out_lines)

    #print out_lines
    # output to new file
    open('dest.txt', 'w').write(out_lines)

def get_cord_matt():
    #magical code to hit the endpoint
    r = requests.get(DATA_URL)
    response = r.json()
    return response

def cluster_coords(response):
    #create dataframe
    df = pd.DataFrame(columns=['latitude','longitude','cleaned','type'])
    coordsC = [(0.0,0.0)]
    coordsP = [(0.0,0.0)]
    for a in response:
        lat = a['latitude']
        longi = a['longitude']
        type = a['type']
        if a['timeCompleted'] is None:
            cleaned = False
            coordsP.append([lat,longi])
        else:
            cleaned = True
            coordsC.append([lat,longi])
        df = df.append({'latitude':lat,'longitude':longi,'cleaned':cleaned, 'type': type}, ignore_index=True)
        
    #lines = [line.rstrip('\n') for line in open('fix_random.txt')]
    #lines = lines[:-1]
    #for a in lines: 
    #    a = a.split(',')
    #    rand_lat = float(a[0])
    #    rand_long = float(a[1])
    #    coordsC.append([rand_lat,rand_long])
    #    df = df.append({'lat':rand_lat,'long':rand_long,'cleaned':cleaned}, ignore_index=True)
    
    #DBSCAN
    #############need to work on these parameters
    #db = DBSCAN(eps=.1, min_samples=10).fit(df)
    #labels = db.labels_
    #num_clusters = len(set(labels)) - (1 if -1 in labels else 0)
    #clusters = pd.Series([df[labels == i] for i in xrange(num_clusters)])
    groupByType = df[['latitude','longitude']].groupby(df['type'])
    centroids = pd.DataFrame(columns=['latitude','longitude','type','label'])
    for group in groupByType:
        db = DBSCAN(eps=.1,min_samples=10).fit(group[1])
        core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
        core_samples_mask[db.core_sample_indices_] = True
        labels = db.labels_
        uniqueLabels = set(labels)
        for label in uniqueLabels:
            if(label != -1):
                class_member_mask = (labels == label)
                points = [class_member_mask & core_samples_mask]
                center = points.median()
                centroids.append({'latitude':center[0],'longitude':center[1],'type':group,'label':label})


    print(centroids)
    #print(clusters)
    #print('Number of clusters: %d' % num_clusters)
    return clusters

def getCentroid(points):
    n = points.shape[0]
    sum_lon = np.sum(points[:, 1])
    sum_lat = np.sum(points[:, 0])
    return (sum_lon/n, sum_lat/n)

def getNearestPoint(set_of_points, point_of_reference):
    closest_point = None
    closest_dist = None
    for point in set_of_points:
        point = (point[1], point[0])
        dist = great_circle(point_of_reference, point).meters
        if (closest_dist is None) or (dist < closest_dist):
            closest_point = point
            closest_dist = dist
    return closest_point

a = get_cord_matt()
#print(a)
b = cluster_coords(a)
